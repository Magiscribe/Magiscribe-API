import { uploadAsset } from '@controllers/assets';
import {
  generateTranscriptionStreamingCredentials,
  transcribeAudio,
} from '@controllers/transcription';
import { StaticGraphQLModule } from '@graphql';

export const AssetModule: StaticGraphQLModule = {
  schema: `#graphql
    type TemporaryCredentials {
      accessKeyId: String!
      secretAccessKey: String!
      sessionToken: String!
    }

    type Mutation {
      addMediaAsset(fileType: String!, fileName: String!): String
      transcribeAudio(fileName: String!): String
      generateTranscriptionStreamingCredentials: TemporaryCredentials
    }
  `,

  resolvers: {
    Mutation: {
      addMediaAsset: async (_, { fileType, fileName }) =>
        uploadAsset(fileType, fileName),
      transcribeAudio: async (_, { fileName }) => transcribeAudio(fileName),
      generateTranscriptionStreamingCredentials,
    },
  },
};

export default AssetModule;
