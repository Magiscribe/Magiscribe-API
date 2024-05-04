import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '../controllers/prediction';

const mutations = {
  addVisualPrediction: (_, { prompt, context }) => {
    generateVisualPrediction(prompt, context);

    return {
      message: 'Prediction added',
    };
  },

  addTextPrediction: (_, { prompt }) => {
    generateTextPredictionStreaming(prompt);

    return {
      message: 'Prediction added',
    };
  },
};

export default mutations;
