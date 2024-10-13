import { downloadAsset, uploadAsset } from '@controllers/assets';

export default {
  Mutation: {
    addMediaAsset: async (_, { s3Key }) =>
      uploadAsset({ s3Key }),
    getMediaAsset: async (_, { s3Key }) =>
      downloadAsset({ s3Key }),
  },
};
