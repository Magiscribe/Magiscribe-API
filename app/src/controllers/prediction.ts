import { SubscriptionEvent } from '@graphql/subscription-events';
import logger from '@log';
import { makeStreamingRequest, makeSyncRequest } from '@utils/ai/requests';
import { getAgentPrompt } from '@utils/ai/system';
import { pubsubClient as subscriptionClient } from '@utils/clients';
import { cleanCodeBlock, executePythonCode } from '@utils/code';

/**
 * Generates a visual prediction based on the given prompt and context.
 *
 * @param {string} prompt - The prompt to generate the prediction for.
 * @param {string} context - The context to generate the prediction with.
 * @returns {Promise<void>} The generated prediction as an array of results.
 */
export async function generateVisualPrediction({
  subscriptionId,
  prompt,
  context,
}): Promise<void> {
  try {
    logger.info({ msg: 'Prediction generation started', prompt, context });

    // Preprocess the prompt
    // TODO: Refactor this to use a more generic preprocessing system
    const preprocessingAgent = 'preprocessingAgent';
    const { prompt: systemPrompt, model } =
      await getAgentPrompt(preprocessingAgent);

    if (!systemPrompt) {
      throw new Error(
        `No system prompt found for agent: ${preprocessingAgent}`,
      );
    }

    const preprocessingResponse = await makeSyncRequest({
      system: systemPrompt,
      model,
      prompt,
      context,
    });

    logger.debug({
      msg: 'Preprocessing response received',
      preprocessingResponse,
    });

    const cleanedPreprocessingResponse = cleanCodeBlock(preprocessingResponse);

    logger.debug({
      msg: 'Cleaned preprocessing response',
      cleanedPreprocessingResponse,
    });

    // Validate cleaned JSON response
    let processingSteps;
    try {
      const parsedResponse = JSON.parse(cleanedPreprocessingResponse);
      processingSteps = parsedResponse.processingSteps;
    } catch (parseError) {
      logger.error({
        msg: 'Failed to parse cleaned preprocessing response',
        error: parseError,
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
        async (step: { prompt: string; agent: string; context: string }) => {
          const { prompt: systemPrompt, model } = await getAgentPrompt(
            step.agent,
          );

          if (!systemPrompt) {
            throw new Error(`No system prompt found for agent: ${step.agent}`);
          }

          const result = await makeSyncRequest({
            prompt: step.prompt,
            system: systemPrompt,
            model,
            context: step.context,
          });
          const cleanedResult = cleanCodeBlock(result);
          return executePythonCode(cleanedResult);
        },
      ),
    );

    const visualPredictionAddedResult = {
      subscriptionId,
      prompt,
      context,
      result: JSON.stringify(results),
    };

    logger.debug({ msg: 'Prediction generated', results });
    subscriptionClient.publish(SubscriptionEvent.VISUAL_PREDICTION_ADDED, {
      visualPredictionAdded: visualPredictionAddedResult,
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
export async function generateTextPredictionStreaming({
  subscriptionId,
  prompt,
}): Promise<void> {
  try {
    logger.debug({ msg: 'Prediction generation started', prompt });

    // Generate the prediction in a streaming manner
    await makeStreamingRequest({ prompt }, async (chunk) => {
      subscriptionClient.publish(SubscriptionEvent.TEXT_PREDICTION_ADDED, {
        textPredictionAdded: { subscriptionId, prompt, result: chunk },
      });
    });
  } catch (error) {
    logger.warn({ msg: 'Prediction generation failed', error });
    throw error;
  }
}
