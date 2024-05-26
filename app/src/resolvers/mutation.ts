import { uploadAsset } from '@controllers/assets';
import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '@controllers/prediction';
import {
  generateTranscriptionStreamingCredentials,
  transcribeAudio,
} from '@controllers/transcription';

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
  transcribeAudio: async (_, { fileName }) => transcribeAudio(fileName),
  generateTranscriptionStreamingCredentials,
};

export default mutations;
