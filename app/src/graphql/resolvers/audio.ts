import {
  generateAudio,
  generateTranscriptionStreamingCredentials,
} from '@controllers/audio';
import { MutationGenerateAudioArgs } from '@generated/graphql';

export default {
  Mutation: {
    generateTranscriptionStreamingCredentials: async () =>
      generateTranscriptionStreamingCredentials(),

    generateAudio: async (_, { voice, text }: MutationGenerateAudioArgs) =>
      generateAudio(voice, text),
  },
};
