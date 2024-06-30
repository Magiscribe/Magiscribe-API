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

  await pubsubClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
    visualPredictionAdded: {
      id: uuid(),
      subscriptionId,
      prompt,
      result,
      type,
      context: contextMap[type],
    },
  });
}

/**
 * Preprocesses the user prompt to generate a reasoning prompt for the agent.
 * If no reasoning prompt is provided, returns null.
 *
 * @param {string} userPrompt - The initial prompt provided by the user.
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

async function getProcessingSteps(agent: IAgent, variables: { [key: string]: string }){
  const processingSteps = await preprocess(variables, agent);

  // If, we have processing steps, we need to return an array of steps
  // with the prompt and the capability object.
  if (processingSteps) {
    return await Promise.all(
      processingSteps.map(async (step) => ({
        ...step,
        capability: (await getCapability(step.capabilityAlias))!, // tODO: Add check for null
      })),
    );
  }

  // If no processing steps are provided, we need to return an array of steps
  // with the prompt and the capability object.
  return agent.capabilities.map((capability: ICapability) => ({
    ...variables,
    capability,
  }));
}

async function executeStep(step: any, subscriptionId: string) {
  if (!step.capability) {
    throw new Error(`No capability found for alias: ${step.capability}`);
  }

  const prompt = [
    step.prompt,
    ...step.capability.prompts.map((prompt) => prompt.text),
  ]
    .join('\n')
    .trim();

  const result = await makeRequest({
    prompt,
    model: step.capability.llmModel,
    streaming:
      step.capability.outputMode ===
      OutputReturnMode.STREAMING_INDIVIDUAL
        ? {
            enabled: true,
            callback: async (content: string) => {
              log.debug({
                msg: 'Streaming AI response chunk received',
                content,
              });
              await publishPredictionEvent(
                subscriptionId,
                'DATA',
                step.prompt,
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
    ].includes(step.capability.outputMode)
  ) {
    const executedResult = await utils.executePythonCode(
      utils.cleanCodeBlock(result),
    );

    if (
      step.capability.outputMode ===
      OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL
    ) {
      await publishPredictionEvent(
        subscriptionId,
        'DATA',
        step.prompt,
        utils.applyFilter(executedResult, step.capability.subscriptionFilter),
      );
    }
    
    return utils.applyFilter(executedResult, step.capability.outputFilter);
  }

  return utils.applyFilter(result, step.capability.outputFilter);
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
  try {
    if (!variables.prompt) {
      throw new Error('No user prompt provided');
    }

    log.info({
      msg: 'Prediction generation started',
      user,
      variables,
    });
    await publishPredictionEvent(subscriptionId, 'RECIEVED', variables.prompt);

    const agent = await getAgent(agentId);
    if (!agent) throw new Error(`No agent found for ID: ${agentId}`);

    const thread = await findOrCreateThread(subscriptionId);
    await addUserMessage(thread, user.sub, variables.prompt);

    if (agent.memoryEnabled) {
      const history = thread.messages.map((message) => message.response.response)
        .join('\n');
      variables.history = history;
    }

    const steps = await getProcessingSteps(agent, variables);

    const results = await Promise.all(
      steps.map((step) => executeStep(step, subscriptionId)),
    );
    const finalResult = JSON.stringify(results.filter((item) => item !== null));

    log.debug({ msg: 'Prediction generated', results });
    await addAgentMessage(thread, agentId, 
      utils.applyFilter(finalResult, agent.outputFilter)
    );

    await publishPredictionEvent(
      subscriptionId,
      'DATA',
      variables.prompt,
      utils.applyFilter(finalResult, agent.subscriptionFilter),
    );
    await publishPredictionEvent(subscriptionId, 'SUCCESS', variables.prompt);
  } catch (error) {
    log.warn({
      msg: 'Prediction generation failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    await publishPredictionEvent(subscriptionId, 'ERROR', variables.prompt);
  }
}