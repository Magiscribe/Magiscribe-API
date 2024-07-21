import config from '@config';
import { OutputReturnMode } from '@database/models/agent';
import { Agent, Capability } from '@generated/graphql';
import { SubscriptionEvent } from '@graphql/subscription-events';
import log from '@log';
import { makeRequest } from '@utils/ai/requests';
import {
  addAgentMessage,
  addUserMessage,
  buildPrompt,
  findOrCreateThread,
  getAgent,
  getCapability,
} from '@utils/ai/system';
import { pubsubClient } from '@utils/clients';
import * as utils from '@utils/code';
import { uuid } from 'uuidv4';

enum PredictionEventType {
  RECIEVED = 'RECIEVED',
  DATA = 'DATA',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

/**
 * Publishes a prediction event to the predictionAdded subscription.
 * @param eventId Unique identifier for the event
 * @param subscriptionId Identifier for the associated subscription
 * @param type Type of prediction event (e.g., RECEIVED, DATA, SUCCESS, ERROR, DEBUG)
 * @param result Optional result data for the prediction event
 * @returns Promise that resolves when the event is published
 */
async function publishPredictionEvent(
  eventId: string,
  subscriptionId: string,
  type: PredictionEventType,
  result?: string,
) {
  const contextMap = {
    RECIEVED: 'User prompt received',
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
): Promise<Array<{
  prompt: string;
  context: string;
  capabilityAlias: string;
}> | null> {
  if (!agent.reasoning) {
    return null;
  }

  log.trace({
    msg: 'Variables before buildPrompt',
    variables: JSON.stringify(variables, null, 2),
    reasoningPrompt: agent.reasoning.prompt,
  });

  const prompt = await buildPrompt(agent.reasoning.prompt, variables);

  log.trace({
    msg: 'Prompt after buildPrompt',
    prompt: prompt,
  });

  const preprocessingResponse = await makeRequest({
    prompt,
    model: agent.reasoning.llmModel,
  });
  const cleanedPreprocessingResponse = utils.cleanCodeBlock(
    preprocessingResponse,
  );

  try {
    const parsedResponse = JSON.parse(cleanedPreprocessingResponse);
    return parsedResponse.processingSteps;
  } catch (error) {
    log.error({
      msg: 'Failed to parse cleaned preprocessing response',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new Error('Invalid JSON response from preprocessing');
  }
}

async function getProcessingSteps(
  agent: Agent,
  variables: { [key: string]: string },
) {
  const reasoningSteps = await reason(variables, agent);

  // If, we have reasoning steps, we need to return an array of steps
  // with the prompt and a capability object that wlll perform the action.
  if (reasoningSteps) {
    // With reasoning, initial variables can be optional passed through to the
    // capability.
    const passThroughVariables = agent.reasoning?.variablePassThrough
      ? variables
      : {};

    return await Promise.all(
      reasoningSteps.map(async (step) => ({
        ...step,
        ...passThroughVariables,
        capability: await getCapability(step.capabilityAlias),
      })),
    );
  }

  // If no reasoning steps are provided, we need to return an array of steps
  // with the prompt and the capability object. This allows agents to be present
  // that do not require reasoning. We automatically pass all variables through to this.
  return agent.capabilities.map((capability) => ({
    ...variables,
    capability,
  }));
}

async function executeStep(
  step: {
    [key: string]: string | Capability;
  },
  eventId: string,
  subscriptionId: string,
) {
  if (!step.capability) {
    throw new Error(`No capability found.`);
  }

  const capability = step.capability as Capability;
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

  const result = await makeRequest({
    prompt,
    model: capability.llmModel,
    streaming:
      capability.outputMode === OutputReturnMode.STREAMING_INDIVIDUAL
        ? {
            enabled: true,
            callback: async (content: string) => {
              log.debug({
                msg: 'Streaming AI response chunk received',
                content,
              });
              await publishPredictionEvent(
                eventId,
                subscriptionId,
                PredictionEventType.DATA,
                content,
              );
            },
          }
        : undefined,
  });

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
      await publishPredictionEvent(
        eventId,
        subscriptionId,
        PredictionEventType.DATA,
        utils.applyFilter(executedResult, capability.subscriptionFilter),
      );
    }

    return utils.applyFilter(executedResult, capability.outputFilter);
  }

  return utils.applyFilter(result, capability.outputFilter);
}

export async function generatePrediction({
  auth,
  subscriptionId,
  agentId,
  variables,
}: {
  auth: { sub: string };
  subscriptionId: string;
  agentId: string;
  variables: { [key: string]: string };
}): Promise<void> {
  if (!variables.userMessage) {
    throw new Error('No user prompt provided');
  }

  log.info({
    msg: 'Querying Hal 9000 for prediction (AI prediction request)',
    auth,
    variables,
  });

  const eventId = uuid();

  try {
    await publishPredictionEvent(
      eventId,
      subscriptionId,
      PredictionEventType.RECIEVED,
      variables.userMessage,
    );

    const agent = await getAgent(agentId);
    if (!agent) throw new Error(`No agent found for ID: ${agentId}`);

    const thread = await findOrCreateThread(subscriptionId);
    await addUserMessage(thread, auth.sub, variables.userMessage);

    if (agent.memoryEnabled) {
      // TODO: May want to include customizaiton to change the
      //       username / agent name.
      const history = thread.messages
        .map(
          (message) =>
            `${message.userId ? 'User' : 'Agent'}:
      ${message.response.response}`,
        )
        .join('\n');
      variables.history = history;
    }

    const steps = await getProcessingSteps(agent, variables);

    if (config.environment === 'dev') {
      await publishPredictionEvent(
        eventId,
        subscriptionId,
        PredictionEventType.DEBUG,
        JSON.stringify(steps),
      );
    }

    const results = await Promise.all(
      steps.map((step) => executeStep(step, eventId, subscriptionId)),
    );
    const finalResult = JSON.stringify(results.filter((item) => item !== null));

    await publishPredictionEvent(
      eventId,
      subscriptionId,
      PredictionEventType.SUCCESS,
      finalResult,
    );

    await addAgentMessage(
      thread,
      agentId,
      utils.applyFilter(finalResult, agent.outputFilter),
    );

    log.info({
      msg: 'Prediction generation successful',
      auth,
      variables,
      results,
    });
  } catch (error) {
    log.warn({
      msg: 'Prediction generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    await publishPredictionEvent(
      eventId,
      subscriptionId,
      PredictionEventType.ERROR,
      error instanceof Error ? error.message : 'Unknown error',
    );
  }
}
