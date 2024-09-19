import { generateAudio } from '@controllers/audio';
import { MutationGenerateAudioArgs } from '@graphql/codegen';

export default {
  Mutation: {
    generateAudio: async (_, { voice, text }: MutationGenerateAudioArgs) =>
      generateAudio(voice, text),
  },
};
