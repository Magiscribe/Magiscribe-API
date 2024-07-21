import { uploadAsset } from '@controllers/assets';

export default {
  Mutation: {
    addMediaAsset: async (_, { fileName, fileType }) =>
      uploadAsset({ fileName, fileType }),
  },
};
