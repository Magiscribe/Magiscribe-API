import { deleteAsset, getAsset, uploadAsset } from '@/controllers/assets';
import {
  MutationDeleteMediaAssetArgs,
  QueryGetMediaAssetArgs,
} from '@/graphql/codegen';

export default {
  Query: {
    getMediaAsset: async (_, { id }: QueryGetMediaAssetArgs) =>
      getAsset({
        id,
      }),
  },
  Mutation: {
    addMediaAsset: async (_, _args, context) =>
      uploadAsset({
        userId: context.auth.sub,
      }),

    deleteMediaAsset: async (
      _,
      { id }: MutationDeleteMediaAssetArgs,
      context,
    ) =>
      deleteAsset({
        userId: context.auth.sub,
        id,
      }),
  },
};
