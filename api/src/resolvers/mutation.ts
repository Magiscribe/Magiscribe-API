import {
  Agents,
  cleanJsonCode,
  cleanPythonCode,
  executePrediction,
} from '../utils/ai/system';
import { pubsubClient } from '../utils/clients';
import { executePythonCode } from '../utils/code';

const generatePrediction = async (prompt, context) => {
  const res = await executePrediction({
    prompt,
    agent: Agents.PreprocessingAgent,
  });

  const cleanedRes = cleanJsonCode(res);
  const json = JSON.parse(cleanedRes).processingSteps;

  // Add the context to each object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processedJson = json.map((obj: any) => {
    return {
      ...obj,
      context,
    };
  });

  const result = await Promise.all(
    processedJson.map(async (step) => {
      let result = await executePrediction({
        prompt: step.prompt,
        agent: step,
      });

      const cleanedRes = cleanPythonCode(result);
      result = await executePythonCode(cleanedRes);

      return result;
    }),
  );

  pubsubClient.publish('PREDICTION_ADDED', {
    predictionAdded: {
      prompt,
      context,
      result: JSON.stringify(result),
    },
  });
};

const mutations = {
  addPrediction: (_, { prompt, context }) => {
    generatePrediction(prompt, context);

    return {
      message: 'Prediction added',
    };
  },
};

export default mutations;
