import {
  generateAudio,
  generateTranscriptionStreamingCredentials,
} from '@controllers/audio';
import { StaticGraphQLModule } from '@graphql';

export const AudioModule: StaticGraphQLModule = {
  schema: `#graphql
    type TemporaryCredentials {
      accessKeyId: String!
      secretAccessKey: String!
      sessionToken: String!
    }

    type Mutation {
      generateTranscriptionStreamingCredentials: TemporaryCredentials
      generateAudio(voice: String!, text: String!): String
    }
  `,

  resolvers: {
    Mutation: {
      generateTranscriptionStreamingCredentials: async () =>
        generateTranscriptionStreamingCredentials(),

      generateAudio: async (_, { voice, text }) => generateAudio(voice, text),
    },
  },
};

export default AudioModule;
