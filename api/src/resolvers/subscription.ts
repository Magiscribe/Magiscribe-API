import { pubsubClient } from '../utils/clients';

const subscription = {
  visualPredictionAdded: {
    subscribe: () => pubsubClient.asyncIterator(['VISUAL_PREDICTION_ADDED']),
  },
  textPredictionAdded: {
    subscribe: () => pubsubClient.asyncIterator(['TEXT_PREDICTION_ADDED']),
  },
};

export default subscription;
