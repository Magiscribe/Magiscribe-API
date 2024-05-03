import {
  Agents,
  cleanJsonCode,
  cleanPythonCode,
  executePrediction,
} from '../utils/ai/system';
import { executeCode } from '../utils/code';
import pubsub from '../utils/pubsub';

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
      result = await executeCode(cleanedRes);

      return result;
    }),
  );

  console.log('res', result);

  pubsub.publish('PREDICTION_ADDED', {
    predictionAdded: {
      prompt,
      context,
      result: JSON.stringify(result),
    },
  });
}

const mutations = {
  addPrediction: (_, { prompt, context }) => {
    console.log('Adding prediction');
    generatePrediction(prompt, context);

    return {
      message: 'Prediction added',
    };
  },
};

export default mutations;
