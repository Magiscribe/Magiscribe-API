import { Agents, cleanJsonCode, cleanPythonCode, executePrediction } from '../utils/ai/system';
import { executeCode } from '../utils/code';

const mutations = {
  addPrediction: async (_, { prompt, context }) => {
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

    const result = await Promise.all(processedJson.map(async (step) => {
      let result = await executePrediction({
        prompt: step.prompt,
        agent: step
      });

      const cleanedRes = cleanPythonCode(result);
      result = await executeCode(cleanedRes);

      return result;
    }));

    return {
      prompt,
      context,
      result: JSON.stringify(result),
    };
  },
};

export default mutations;
