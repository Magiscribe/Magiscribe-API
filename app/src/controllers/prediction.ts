import logger from '@log';
import { SubscriptionEvents } from '@resolvers/subscription';
import { makeStreamingRequest, makeSyncRequest } from '@utils/ai/requests';
import { Agents, chooseSystemPrompt } from '@utils/ai/system';
import { cleanCodeBlock } from '@utils/clean';
import { pubsubClient as subscriptionClient } from '@utils/clients';
import { executePythonCode } from '@utils/code';

/**
 * Generates a visual prediction based on the given prompt and context.
 *
 * @param {string} prompt - The prompt to generate the prediction for.
 * @param {string} context - The context to generate the prediction with.
 * @returns {Promise<void>} The generated prediction as an array of results.
 */
export async function generateVisualPrediction(
  prompt: string,
  context: string,
): Promise<void> {
  try {
    logger.info({ msg: 'Prediction generation started', prompt, context });

    // Preprocess the prompt
    const promptTemplate = chooseSystemPrompt(Agents.PreprocessingAgent);
    const preprocessingResponse = await makeSyncRequest({
      system: promptTemplate,
      prompt,
    });
    const cleanedPreprocessingResponse = cleanCodeBlock(
      preprocessingResponse,
      'json',
    );
    const processingSteps = JSON.parse(
      cleanedPreprocessingResponse,
    ).processingSteps;
    logger.debug({
      msg: 'Prediction preprocessing completed',
      processingSteps,
    });

    // Process the steps with the context
    const processedSteps = processingSteps.map((step) => ({
      ...step,
      context,
    }));

    // Execute the processed steps and generate the results
    const results = await Promise.all(
      processedSteps.map(async (step: { prompt: string; agent: Agents }) => {
        const result = await makeSyncRequest({
          prompt: step.prompt,
          system: chooseSystemPrompt(step.agent),
        });
        const cleanedResult = cleanCodeBlock(result, 'python');
        return executePythonCode(cleanedResult);
      }),
    );

    logger.debug({ msg: 'Prediction generated', results });
    subscriptionClient.publish(SubscriptionEvents.VISUAL_PREDICTION_ADDED, {
      visualPredictionAdded: {
        prompt,
        context,
        result: JSON.stringify(results),
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.warn({
      msg: 'Prediction generation failed',
      error: error.message,
    });
  }
}

/**
 * Generates a text prediction in a streaming manner and publishes the result chunks to a subscription.
 *
 * @param {string} prompt - The prompt to generate the prediction for.
 * @returns {Promise<void>}
 */
export async function generateTextPredictionStreaming(
  prompt: string,
): Promise<void> {
  try {
    logger.debug({ msg: 'Prediction generation started', prompt });

    // Generate the prediction in a streaming manner
    await makeStreamingRequest({ prompt }, async (chunk) => {
      subscriptionClient.publish(SubscriptionEvents.TEXT_PREDICTION_ADDED, {
        textPredictionAdded: { prompt, result: chunk },
      });
    });
  } catch (error) {
    logger.warn({ msg: 'Prediction generation failed', error });
    throw error;
  }
}
