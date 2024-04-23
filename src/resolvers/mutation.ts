import { Agents, cleanJsonCode, executePrediction } from "utils/ai/system";

const mutations = {
    addPrediction: async (_, { prompt, context }) => {
        const res = await executePrediction({
            prompt,
            agent: Agents.PreprocessingAgent,
        });

        const cleanedRes = cleanJsonCode(res);
        const json = JSON.parse(cleanedRes).processingSteps;

        // Add the context to each object
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedJson = json.map((obj: any) => {
            return {
                ...obj,
                context,
            };
        });

        console.log(
            processedJson
        )

        return {
            prompt,
            context: "the next big thing in tech will be",
            result: "a new type of AI that can predict the future"
        };
    }
}

export default mutations;