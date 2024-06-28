import { Thread } from '@database/models/message';
import { SubscriptionEvent } from '@graphql/subscription-events';
import logger from '@log';
import { makeRequest } from '@utils/ai/requests';
import { getAgent, getCapability, getThreadContext } from '@utils/ai/system';
import { pubsubClient as subscriptionClient } from '@utils/clients';
import { cleanCodeBlock, executePythonCode } from '@utils/code';

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
  prompt,
  context,
}): Promise<void> {
  try {
    logger.info({ msg: 'Prediction generation started', prompt, context });

    subscriptionClient.publish(SubscriptionEvent.VISUAL_PREDICTION_ADDED, {
      visualPredictionAdded: {
        subscriptionId,
        prompt,
        context: 'Prediction generation started',
        type: 'RECIEVED',
      },
    });

    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error(`No agent found for ID: ${agentId}`);
    }

    const threadContext = await getThreadContext(subscriptionId);
    // Get or create a thread for the subscription ID.
    const thread = await Thread.findOneAndUpdate(
      { subscriptionId },
      { $setOnInsert: { messages: [] } },
      { upsert: true, new: true }
    );

    // Add user message to the thread.
    thread.messages.push({
      userId: user.sub,
      response: {
        type: 'text',
        response: prompt,
      },
    });
    thread.save();

    const preprocessingResponse = await makeRequest({
      prompt,
      context: threadContext,
      system: agent.reasoningPrompt,
      model: agent.reasoningLLMModel,
    });
    const cleanedPreprocessingResponse = cleanCodeBlock(preprocessingResponse);

    logger.debug({
      msg: 'Preprocessing response received',
      cleanedPreprocessingResponse,
    });

    // Validate cleaned JSON response
    let processingSteps;
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

    // Execute the processed steps and generate the results
    const results = await Promise.all(
      processingSteps.map(
        async (step: {
          prompt: string;
          capability: string;
          context: string;
        }) => {
          const capability = await getCapability(step.capability);
          if (!capability) {
            throw new Error(
              `No capability found for alias: ${step.capability}`,
            );
          }

          const result = await makeRequest({
            prompt: step.prompt,
            context: step.context,
            model: capability.llmModel,
            system: capability.prompts.map((prompt) => prompt.text).join('\n'),
            streaming:
              capability.outputMode == 'STREAMING_INDIVIDUAL'
                ? {
                    enabled: true,
                    callback: async (content: string) => {
                      logger.debug({
                        msg: 'Streaming AI response chunk received',
                        content,
                      });
                      subscriptionClient.publish(
                        SubscriptionEvent.VISUAL_PREDICTION_ADDED,
                        {
                          visualPredictionAdded: {
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
          const cleanedResult = cleanCodeBlock(result);

          // Execute the Python code block, if any fails, try to fix it.
          if (capability.outputMode === 'SYNCHRONOUS_EXECUTION_AGGREGATE') {
            try {
              const pythonCodeResult = await executePythonCode(cleanedResult);
              return pythonCodeResult;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
              // TODO: Create a formal review process within the agent architecture to handle errors and review multistep progress
              if (
                typeof error === 'object' &&
                error !== null &&
                'isPythonExecutionError' in error
              ) {
                logger.warn({
                  msg: 'Python code execution error, trying to autofix',
                  error: error.message,
                });

                const fixCapability = await getCapability('CodeFixCapability');
                if (!fixCapability) {
                  throw new Error(
                    `No capability found for alias: CodeFixCapability`,
                  );
                }

                const fixedResult = await makeRequest({
                  prompt: `This original prompt: "${step.prompt}" led to this code: "${cleanedResult}" which had this error: ${error}`,
                  model: fixCapability.llmModel,
                  system: fixCapability.prompts
                    .map((prompt) => prompt.text)
                    .join('\n'),
                  context: `Original Context: ${step.context}`,
                });
                const cleanedResult2 = cleanCodeBlock(fixedResult);
                return await executePythonCode(cleanedResult2);
              } else {
                throw error; // Re-throw unexpected errors
              }
            }
          }
        },
      ),
    );

    logger.debug({ msg: 'Prediction generated', results });

    // Add user message to the thread.
    thread.messages.push({
      agentId: agentId,
      response: {
        type: 'command',
        response: JSON.stringify(results.filter((item) => item !== null)),
      },
    });
    thread.save();

    await subscriptionClient.publish(
      SubscriptionEvent.VISUAL_PREDICTION_ADDED,
      {
        visualPredictionAdded: {
          subscriptionId,
          prompt,
          context: 'Prediction generation completed',
          result: JSON.stringify(results.filter((item) => item !== null)),
          type: 'DATA',
        },
      },
    );

    await subscriptionClient.publish(
      SubscriptionEvent.VISUAL_PREDICTION_ADDED,
      {
        visualPredictionAdded: {
          subscriptionId,
          prompt,
          context: 'Prediction generation completed',
          type: 'SUCCESS',
        },
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.warn({
      msg: 'Prediction generation failed',
      error: error.message,
    });
    subscriptionClient.publish(SubscriptionEvent.VISUAL_PREDICTION_ADDED, {
      visualPredictionAdded: {
        subscriptionId,
        prompt,
        context: 'Prediction generation failed',
        type: 'ERROR',
      },
    });
  }
}