import {
  generateAudio,
  generateTranscriptionStreamingCredentials,
} from '@controllers/audio';

export const AudioModule = {
  Mutation: {
    generateTranscriptionStreamingCredentials: async () =>
      generateTranscriptionStreamingCredentials(),

    generateAudio: async (_, { voice, text }) => generateAudio(voice, text),
  },
};

export default AudioModule;
