import { generateAudio } from '@controllers/audio';
import { MutationGenerateAudioArgs } from '@graphql/codegen';
import { VOICES } from '@utils/voices';

export default {
  Query: {
    getAllAudioVoices: async () => {
      return Object.keys(VOICES).map((key) => {
        return {
          id: key,
          name: VOICES[key].name,
        };
      });
    },
  },
  Mutation: {
    generateAudio: async (_, { voice, text }: MutationGenerateAudioArgs) =>
      generateAudio(voice, text),
  },
};
