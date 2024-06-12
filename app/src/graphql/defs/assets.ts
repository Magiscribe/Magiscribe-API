import { uploadAsset } from '@controllers/assets';
import { StaticGraphQLModule } from '@graphql';

export const AssetModule: StaticGraphQLModule = {
  schema: `#graphql
    type Mutation {
      addMediaAsset(fileType: String!, fileName: String!): String
    }
  `,

  resolvers: {
    Mutation: {
      addMediaAsset: async (_, { fileType, fileName }) =>
        uploadAsset(fileType, fileName),
    },
  },
};

export default AssetModule;
