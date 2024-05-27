import { uploadAsset } from '@controllers/assets';
import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '@controllers/prediction';
const mutations = {
  addVisualPrediction: (_, { prompt, context }) => {
    generateVisualPrediction(prompt, context);

    return 'Prediction added';
  },

  addTextPrediction: (_, { prompt }) => {
    generateTextPredictionStreaming(prompt);

    return 'Prediction added';
  },

  // Experimental
  addMediaAsset: async (_, { fileType, fileName }) =>
    uploadAsset(fileType, fileName),
};

export default mutations;
