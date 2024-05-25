import { uploadMediaAsset } from '@controllers/assets';
import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '@controllers/prediction';
import { generateTranscription } from '@controllers/transcription';

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

  // Experimental
  addMediaAsset: async (_, { fileType, fileName }) =>
    uploadMediaAsset(fileType, fileName),
  transcribeAudio: async (_, { fileName }) => generateTranscription(fileName),
};

export default mutations;
