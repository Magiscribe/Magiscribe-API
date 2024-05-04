import logger from '@log';
import { makeStreamingRequest } from '@utils/ai';
import {
  Agents,
  cleanJsonCode,
  cleanPythonCode,
  executePrediction,
} from '@utils/ai/system';
import { pubsubClient as subscriptionClient } from '@utils/clients';
import { executePythonCode } from '@utils/code';

/**
 * Generates a visual prediction based on the given prompt and context.
 * @param prompt {string} The prompt to generate the prediction for.
 * @param context {string} The context to generate the prediction with.
 * @returns The generated prediction.
 */
export async function generateVisualPrediction(
  prompt: string,
  context: string,
) {
  try {
    console.log({
      msg: 'Prediction generation started',
      prompt,
      context,
    });

    const preprocessingResponse = await executePrediction({
      prompt,
      agent: Agents.PreprocessingAgent,
    });
    const cleanedPreprocessingResponse = cleanJsonCode(preprocessingResponse);
    const processingSteps = JSON.parse(
      cleanedPreprocessingResponse,
    ).processingSteps;

    logger.debug({
      msg: 'Prediction preprocessing completed',
      processingSteps,
    });

    const processedSteps = processingSteps.map((step) => ({
      ...step,
      context,
    }));

    const results = await Promise.all(
      processedSteps.map(async (step: { prompt: string; agent: Agents }) => {
        let result = await executePrediction({
          prompt: step.prompt,
          agent: step.agent,
        });
        const cleanedResult = cleanPythonCode(result);
        result = await executePythonCode(cleanedResult);
        return result;
      }),
    );

    logger.debug({
      msg: 'Prediction generated',
      results,
    });

    subscriptionClient.publish('VISUAL_PREDICTION_ADDED', {
      visualPredictionAdded: {
        prompt,
        context,
        result: JSON.stringify(results),
      },
    });

    return results;
  } catch (error) {
    logger.warn({
      msg: 'Prediction generation failed',
      error,
    });
    throw error;
  }
}

export async function generateTextPredictionStreaming(
  prompt: string,
): Promise<void> {
  try {
    logger.debug({
      msg: 'Prediction generation started',
      prompt,
    });

    makeStreamingRequest(
      {
        prompt,
      },
      async (chunk) => {
        subscriptionClient.publish('TEXT_PREDICTION_ADDED', {
          textPredictionAdded: {
            prompt,
            result: chunk,
          },
        });
      },
    );
  } catch (error) {
    logger.warn({
      msg: 'Prediction generation failed',
      error,
    });
    throw error;
  }
}
