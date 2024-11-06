import { deleteAsset, getAsset, uploadAsset } from '@controllers/assets';
import {
  MutationDeleteMediaAssetArgs,
  QueryGetMediaAssetArgs,
} from '@graphql/codegen';

export default {
  Query: {
    getMediaAsset: async (_, { uuid }: QueryGetMediaAssetArgs, context) =>
      getAsset({
        userId: context.auth.sub,
        uuid,
      }),
  },
  Mutation: {
    addMediaAsset: async (_, _args, context) =>
      uploadAsset({
        userId: context.auth.sub,
      }),

    deleteMediaAsset: async (
      _,
      { uuid }: MutationDeleteMediaAssetArgs,
      context,
    ) =>
      deleteAsset({
        userId: context.auth.sub,
        uuid,
      }),
  },
};
