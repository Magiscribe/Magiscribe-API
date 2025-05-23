import config from '@/config';
import { OutputReturnMode } from '@/database/models/agent';
import { Agent, Capability } from '@/graphql/codegen';
import { SubscriptionEvent } from '@/graphql/subscription-events';
import log from '@/log';
import { Content, ContentType, makeRequest } from '@/utils/ai/requests';
import {
  addToThread,
  buildPrompt,
  findOrCreateThread,
  getAgent,
  getCapability,
  getHistory,
} from '@/utils/ai/system';
import { pubsubClient } from '@/utils/clients';
import * as utils from '@/utils/code';
import { v4 as uuid } from 'uuid';

enum PredictionEventType {
  RECEIVED = 'RECEIVED',
  DATA = 'DATA',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface ReasoningResponse {
  processingSteps: Array<{
    prompt: string;
    context: string;
    capabilityAlias: string;
  }>;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

/**
 * Using the reasoning prompt provided in the agent, this function will preprocess and is aimed at
 * providing a more structured approach to the reasoning process. The function will return an array
 * of processing steps, each containing a prompt, capabilityAlias, and any other relevant information
 * required to execute the reasoning the capability.
 * If no reasoning prompt is provided in the agent, this function will return null.
 *
 * @param {Object} variables - Any custom variables that need to be passed to the reasoning prompt and help in the reasoning process.
 * @param {IAgent} agent - The agent object containing reasoning prompt and model information.
 * @returns {Promise<Array<any> | null>} - A promise that resolves to an array of processing steps or null if no reasoning prompt is provided.
 * @throws {Error} - Throws an error if the preprocessing response cannot be parsed as valid JSON.
 */
async function reason(
  variables: { [key: string]: string },
  agent: Agent,
): Promise<ReasoningResponse | null> {
  if (!agent.reasoning) {
    return null;
  }

  const prompt = await buildPrompt(agent.reasoning.prompt, variables);

  const response = await makeRequest({
    content: [
      {
        type: ContentType.TEXT,
        text: prompt,
      },
    ],
    model: agent.reasoning.llmModel,
  });

  const cleanedPreprocessingResponse = utils.cleanCodeBlock(response.content);

  try {
    const parsedResponse = JSON.parse(cleanedPreprocessingResponse);

    log.debug({
      msg: 'Reasoning step token usage',
      tokenUsage: response.tokenUsage,
    });

    return {
      processingSteps: parsedResponse.processingSteps,
      tokenUsage: response.tokenUsage,
    };
  } catch (error) {
    log.error({
      msg: 'Failed to parse cleaned preprocessing response',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Invalid JSON response from preprocessing');
  }
}

async function getSteps(agent: Agent, variables: { [key: string]: string }) {
  const reasoningResult = await reason(variables, agent);

  // If, we have reasoning steps, we need to return an array of steps
  // with the prompt and a capability object that wlll perform the action.
  if (reasoningResult) {
    // With reasoning, initial variables can be optional passed through to the
    // capability.
    const passThroughVariables = agent.reasoning?.variablePassThrough
      ? variables
      : {};

    return (await Promise.all(
      reasoningResult.processingSteps.map(async (step) => ({
        ...passThroughVariables,
        ...step,
        capability: await getCapability(step.capabilityAlias),
      })),
    )) as Array<{ [key: string]: string | Capability }>;
  }

  // If no reasoning steps are provided, we need to return an array of steps
  // with the prompt and the capability object. This allows agents to be present
  // that do not require reasoning. We automatically pass all variables through to this.
  return agent.capabilities.map((capability) => ({
    ...variables,
    capability,
  })) as Array<{ [key: string]: string | Capability }>;
}

/**
 * Executes a single step in the reasoning process.
 * @param step {Object} - The step to execute. Must include a capability.
 * @param eventPublisher {(type: PredictionEventType, data?: string) => Promise<void>} - The function for publishing prediction events.
 * @returns {Promise<string>} - A promise that resolves to the result of the step.
 */
async function executeStep(
  step: {
    [key: string]: string | Capability;
  },
  attachments: Array<Content>,
  eventPublisher: (type: PredictionEventType, data?: string) => Promise<void>,
): Promise<{
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
}> {
  if (!step.capability) {
    throw new Error(`No capability found.`);
  }

  const capability = step.capability as Capability;
  const llmModelAlias = step.llmModelAlias as string | undefined;
  const prompts = capability.prompts?.map((prompt) => prompt?.text);

  // Remove capability from the step variables
  delete step.capability;

  log.debug({
    msg: 'Executing AI prediction step',
    step,
    capability,
  });

  // TODO: Replace with a more structured approach to handling prompts.
  //       E.g., templating engine.
  const prompt = await buildPrompt(
    [...(prompts ?? [])].join('\n').trim(),
    step as { [key: string]: string },
  );

  const response = await makeRequest({
    content: [
      {
        type: ContentType.TEXT,
        text: prompt,
      },
      ...(attachments ?? []),
    ],
    model: llmModelAlias ?? capability.llmModel,
    streaming:
      capability.outputMode === OutputReturnMode.STREAMING_INDIVIDUAL
        ? {
            enabled: true,
            callback: async (content: string) => {
              log.debug({
                msg: 'Streaming AI response chunk received',
                content,
              });
              eventPublisher(PredictionEventType.DATA, content);
            },
          }
        : undefined,
  });

  const result = response.content;
  let finalResult: string;

  if (
    [
      OutputReturnMode.SYNCHRONOUS_EXECUTION_AGGREGATE,
      OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL,
    ].includes(capability.outputMode as OutputReturnMode)
  ) {
    const executedResult = await utils.executePythonCode(
      utils.cleanCodeBlock(result),
    );

    if (
      capability.outputMode === OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL
    ) {
      eventPublisher(PredictionEventType.DATA, executedResult);
    }

    finalResult = utils.applyFilter(executedResult, capability.outputFilter);
  } else {
    finalResult = utils.applyFilter(result, capability.outputFilter);
  }

  return {
    content: finalResult,
    tokenUsage: response.tokenUsage,
    model: llmModelAlias ?? capability.llmModel,
  };
}

/**
 * Executes a series of steps in parallel and returns any non-null results.
 * @param steps {Array<{ [key: string]: string | Capability }>} - The steps to execute.
 * @param eventPublisher {(type: PredictionEventType, data?: string) => Promise<void>} - The function for publishing prediction events.
 * @returns {Promise<string>} - A promise that resolves to a JSON string of the results.
 */
async function executeSteps(
  steps: Array<{
    [key: string]: string | Capability;
  }>,
  attachments: Array<Content>,
  eventPublisher: (type: PredictionEventType, data?: string) => Promise<void>,
): Promise<{
  content: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
}> {
  const results = await Promise.all(
    steps.map((step) => executeStep(step, attachments, eventPublisher)),
  );

  // Aggregate token usage from all steps
  const totalTokenUsage = results.reduce(
    (acc, result) => ({
      inputTokens: acc.inputTokens + result.tokenUsage.inputTokens,
      outputTokens: acc.outputTokens + result.tokenUsage.outputTokens,
      totalTokens: acc.totalTokens + result.tokenUsage.totalTokens,
    }),
    { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  );

  return {
    content: JSON.stringify(
      results.map((r) => r.content).filter((item) => item !== null),
    ),
    tokenUsage: totalTokenUsage,
    model: results[results.length - 1].model, // Use the last model used in the chain
  };
}

/**
 * Creates a function for publishing prediction events.
 * @param eventId Unique identifier for the event
 * @param subscriptionId Identifier for the associated subscription
 * @returns A function that publishes prediction events
 */
function createEventPublisher(eventId: string, subscriptionId: string) {
  return async (type: PredictionEventType, result?: string) => {
    const contextMap = {
      RECEIVED: 'User prompt received',
      DATA: 'Prediction data received',
      SUCCESS: 'Prediction generation successful',
      ERROR: 'Prediction generation failed',
      DEBUG: 'Debug information. Not present in production',
    };

    if (type === PredictionEventType.DEBUG && config.environment !== 'dev') {
      throw new Error('Debug events are not allowed in production');
    }

    log.trace({
      msg: 'Publishing prediction event',
      eventId,
      subscriptionId,
      type,
      result,
      context: contextMap[type],
    });
    return pubsubClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      predictionAdded: {
        id: eventId,
        subscriptionId,
        result,
        type,
        context: contextMap[type],
      },
    });
  };
}

/**
 * Generates a prediction based on the given agent and user input.
 * @param {Object} params - The parameters for prediction generation.
 * @param {Object} params.auth - Authentication information.
 * @param {string} params.auth.sub - The subject (user ID) from the auth token.
 * @param {string} params.subscriptionId - The ID of the subscription.
 * @param {string} params.agentId - The ID of the agent to use.
 * @param {Object} params.variables - Key-value pairs of variables for the prediction.
 * @returns {Promise<void>}
 */
export async function generatePrediction({
  auth,
  subscriptionId,
  agentId,
  variables,
  attachments,
}: {
  auth?: { sub?: string };
  subscriptionId: string;
  agentId: string;
  variables: Record<string, string>;
  attachments: Array<Content>;
}): Promise<void> {
  const publishEvent = createEventPublisher(uuid(), subscriptionId);

  try {
    await publishEvent(PredictionEventType.RECEIVED);
    log.info({ msg: 'Prediction generation started', auth, variables });

    const agent = await getAgent(agentId);
    if (!agent) throw new Error(`No agent found for ID: ${agentId}`);

    const thread = await findOrCreateThread(subscriptionId);
    await addToThread(thread, auth?.sub, variables, true);

    log.debug({
      msg: 'memoryEnabled',
      capabilities: agent.memoryEnabled,
    });
    if (agent.memoryEnabled) {
      variables.history = getHistory(thread);
      log.debug({
        msg: 'history',
        history: variables.history,
      });
    }

    const steps = await getSteps(agent, variables);
    const {
      content: result,
      tokenUsage,
      model,
    } = await executeSteps(steps, attachments, publishEvent);

    await publishEvent(PredictionEventType.SUCCESS, result);
    await addToThread(
      thread,
      agent.id,
      utils.applyFilter(result, agent.outputFilter),
      false,
      tokenUsage,
      model,
    );

    log.info({
      msg: 'Prediction generation successful',
      auth,
      result,
      tokenUsage,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    log.warn({ msg: 'Prediction generation failed', error: errorMessage });
    await publishEvent(PredictionEventType.ERROR, errorMessage);
  }
}
