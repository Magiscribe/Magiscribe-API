import { ICapability, OutputReturnMode } from '@database/models/agent';
import { MessageResponseTypes } from '@database/models/message';
import { SubscriptionEvent } from '@graphql/subscription-events';
import logger from '@log';
import { makeRequest } from '@utils/ai/requests';
import { findAndCreateThread, getAgent, getCapability } from '@utils/ai/system';
import { pubsubClient as subscriptionClient } from '@utils/clients';
import { cleanCodeBlock, executePythonCode } from '@utils/code';
import { uuid } from 'uuidv4';

/**
 * Generates a visual prediction based on the given prompt and context.
 *
 * @param {string} params.subscriptionId - The ID of the subscription.
 * @param {string} params.agentId - The ID of the agent to use for the prediction.
 * @param {string} params.prompt - The prompt to generate the prediction from.
 * @param {string} params.context - The context to use for the prediction.
 * @returns {Promise<void>} The generated prediction as an array of results.
 */
export async function generatePrediction({
  user,
  subscriptionId,
  agentId,
  prompt: userPrompt,
  context,
}): Promise<void> {
  try {
    logger.info({
      msg: 'Prediction generation started',
      user,
      userPrompt,
      context,
    });

    subscriptionClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      visualPredictionAdded: {
        id: uuid(),
        subscriptionId,
        userPrompt,
        context: 'Prediction generation started',
        type: 'RECIEVED',
      },
    });

    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error(`No agent found for ID: ${agentId}`);
    }

    // Get or create a thread for the subscription ID.
    const thread = await findAndCreateThread(subscriptionId);

    // Add user message to the thread.
    thread.messages.push({
      userId: user.sub,
      response: {
        type: MessageResponseTypes.Text,
        response: userPrompt,
      },
    });
    thread.save();

    const prompt = [userPrompt, context, agent.reasoningPrompt]
      .join('\n')
      .trim();

    let processingSteps;
    if (agent.reasoningPrompt) {
      const preprocessingResponse = await makeRequest({
        prompt: userPrompt,
        model: agent.reasoningLLMModel,
      });
      const cleanedPreprocessingResponse = cleanCodeBlock(
        preprocessingResponse,
      );

      logger.debug({
        msg: 'Preprocessing response received',
        cleanedPreprocessingResponse,
      });

      try {
        const parsedResponse = JSON.parse(cleanedPreprocessingResponse);
        processingSteps = parsedResponse.processingSteps;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        logger.error({
          msg: 'Failed to parse cleaned preprocessing response',
          error: error.message,
        });
        throw new Error('Invalid JSON response from preprocessing');
      }

      logger.debug({
        msg: 'Prediction preprocessing completed',
        processingSteps,
      });

      processingSteps = await processingSteps.map(async (step) => ({
        prompt: step.prompt,
        capability: await getCapability(step.capability),
        context: step.context,
      }));
    } else {
      processingSteps = agent.capabilities.map((capability) => ({
        prompt,
        capability,
        context,
      }));
    }

    // Execute the processed steps and generate the results
    const results = await Promise.all(
      processingSteps.map(
        async (step: {
          prompt: string;
          capability: ICapability;
          context: string;
        }) => {
          let result: string | null = null;

          if (!step.capability) {
            throw new Error(
              `No capability found for alias: ${step.capability}`,
            );
          }

          const prompt = [
            step.prompt,
            step.context,
            ...step.capability.prompts.map((prompt) => prompt.text),
          ]
            .join('\n')
            .trim();

          const id = uuid();
          result = await makeRequest({
            prompt,
            model: step.capability.llmModel,
            streaming:
              step.capability.output.returnMode ===
              OutputReturnMode.STREAMING_INDIVIDUAL
                ? {
                    enabled: true,
                    callback: async (content: string) => {
                      logger.debug({
                        msg: 'Streaming AI response chunk received',
                        content,
                      });
                      subscriptionClient.publish(
                        SubscriptionEvent.PREDICTION_ADDED,
                        {
                          visualPredictionAdded: {
                            id,
                            subscriptionId,
                            prompt: step.prompt,
                            context: 'Streaming AI response chunk received',
                            result: content,
                            type: 'DATA',
                          },
                        },
                      );
                    },
                  }
                : undefined,
          });

          const executionModes = [
            OutputReturnMode.SYNCHRONOUS_EXECUTION_AGGREGATE,
            OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL,
          ];

          if (executionModes.includes(step.capability.output.returnMode)) {
            result = await executePythonCode(cleanCodeBlock(result));

            if (
              step.capability.output.returnMode ===
              OutputReturnMode.SYNCHRONOUS_EXECUTION_INVIDUAL
            ) {
              subscriptionClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
                visualPredictionAdded: {
                  id: uuid(),
                  subscriptionId,
                  prompt: step.prompt,
                  context: 'Python code execution completed',
                  result,
                  type: 'DATA',
                },
              });
            }
          }

          const regex = new RegExp(step.capability.output.returnExpression, 'g');
          // Only return the first match
          const matchedResults = result.match(regex);
          return matchedResults ? matchedResults[0] : '';
        },
      ),
    );

    logger.debug({ msg: 'Prediction generated', results });

    // Add message to the thread with the results.
    thread.messages.push({
      agentId: agentId,
      response: {
        type: MessageResponseTypes.Command,
        response: JSON.stringify(results.filter((item) => item !== null)),
      },
    });
    thread.save();

    await subscriptionClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      visualPredictionAdded: {
        id: uuid(),
        subscriptionId,
        prompt,
        context: 'Prediction generation completed',
        result: JSON.stringify(results.filter((item) => item !== null)),
        type: 'DATA',
      },
    });

    await subscriptionClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      visualPredictionAdded: {
        id: uuid(),
        subscriptionId,
        prompt,
        context: 'Prediction generation completed',
        type: 'SUCCESS',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.warn({
      msg: 'Prediction generation failed',
      error: error.message,
    });
    subscriptionClient.publish(SubscriptionEvent.PREDICTION_ADDED, {
      visualPredictionAdded: {
        id: uuid(),
        subscriptionId,
        prompt: userPrompt,
        context: 'Prediction generation failed',
        type: 'ERROR',
      },
    });
  }
}
