import { uploadAsset } from '@controllers/assets';
import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '@controllers/prediction';
const mutations = {
  addVisualPrediction: (_, props) => {
    generateVisualPrediction(props);

    return 'Prediction added';
  },

  addTextPrediction: (_, props) => {
    generateTextPredictionStreaming(props);

    return 'Prediction added';
  },

  // Experimental
  addMediaAsset: async (_, { fileType, fileName }) =>
    uploadAsset(fileType, fileName),
};

export default mutations;
