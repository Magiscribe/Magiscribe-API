import { IAgent, ICapability, OutputReturnMode } from '@database/models/agent';
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

async function publishPredictionEvent(
  eventId: string,
  subscriptionId: string,
  type: 'RECIEVED' | 'DATA' | 'SUCCESS' | 'ERROR',
  prompt?: string,
  result?: string,
) {
  const contextMap = {
    RECIEVED: 'User prompt received',
    DATA: 'Prediction data received',
    SUCCESS: 'Prediction generation successful',
    ERROR: 'Prediction generation failed',
  };

  return pubsubClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
    predictionAdded: {
      id: eventId,
      subscriptionId,
      prompt,
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
async function preprocess(
  variables: { [key: string]: string },
  agent: IAgent,
): Promise<Array<{
  prompt: string;
  context: string;
  capabilityAlias: string;
}> | null> {
  if (!agent.reasoningPrompt) return null;

  const prompt = await buildPrompt(agent.reasoningPrompt, variables);

  const preprocessingResponse = await makeRequest({
    prompt,
    model: agent.reasoningLLMModel,
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
  agent: IAgent,
  variables: { [key: string]: string },
) {
  const processingSteps = await preprocess(variables, agent);

  // If, we have processing steps, we need to return an array of steps
  // with the prompt and the capability object.
  if (processingSteps) {
    return await Promise.all(
      processingSteps.map(async (step) => ({
        ...step,
        capability: (await getCapability(step.capabilityAlias))!, // TODO: Add check for null
      })),
    );
  }

  // If no processing steps are provided, we need to return an array of steps
  // with the prompt and the capability object. This allows agents to be present
  // that do not require preprocessing.
  return agent.capabilities.map((capability: ICapability) => ({
    ...variables,
    capability,
  }));
}

async function executeStep(
  step: {
    [key: string]: string | ICapability;
  },
  eventId: string,
  subscriptionId: string,
) {
  if (!step.capability) {
    throw new Error(`No capability found.`);
  }

  const capability = step.capability as ICapability;
  const prompts = capability.prompts.map((prompt) => prompt.text);

  // Remove capability from the step variables
  delete step.capability;

  // TODO: Replace with a more structured approach to handling prompts.
  //       E.g., templating engine.
  const prompt = [...prompts, ...Object.values(step).map((value) => value)]
    .join('\n')
    .trim();

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
                'DATA',
                '',
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
    ].includes(capability.outputMode)
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
        'DATA',
        '',
        utils.applyFilter(executedResult, capability.subscriptionFilter)
      );
    }

    return utils.applyFilter(executedResult, capability.outputFilter);
  }

  return utils.applyFilter(result, capability.outputFilter);
}

export async function generatePrediction({
  user,
  subscriptionId,
  agentId,
  variables,
}: {
  user: { sub: string };
  subscriptionId: string;
  agentId: string;
  variables: { [key: string]: string };
}): Promise<void> {
  if (!variables.prompt) {
    throw new Error('No user prompt provided');
  }

  log.info({
    msg: 'Querying Hal 9000 for prediction (AI prediction request)',
    user,
    variables,
  });

  const eventId = uuid();

  try {
    await publishPredictionEvent(
      eventId,
      subscriptionId,
      'RECIEVED',
      variables.prompt,
    );

    const agent = await getAgent(agentId);
    if (!agent) throw new Error(`No agent found for ID: ${agentId}`);

    const thread = await findOrCreateThread(subscriptionId);
    await addUserMessage(thread, user.sub, variables.prompt);

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

    const results = await Promise.all(
      steps.map((step) => executeStep(step, eventId, subscriptionId)),
    );
    const finalResult = JSON.stringify(results.filter((item) => item !== null));

    await publishPredictionEvent(
      eventId,
      subscriptionId,
      'SUCCESS',
      '',
      finalResult,
    );

    await addAgentMessage(
      thread,
      agentId,
      utils.applyFilter(finalResult, agent.outputFilter),
    );

    await publishPredictionEvent(
      eventId,
      subscriptionId,
      'SUCCESS',
      finalResult,
    );
  } catch (error) {
    log.warn({
      msg: 'Prediction generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    await publishPredictionEvent(eventId, subscriptionId, 'ERROR', '');
  }
}
