import { uploadAsset } from '@controllers/assets';

export const AssetModule = {
  Mutation: {
    addMediaAsset: async (_, { fileName, fileType }) =>
      uploadAsset({ fileName, fileType }),
  },
};

export default AssetModule;
