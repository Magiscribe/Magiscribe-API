import { pubsubClient } from '../utils/clients';

const subscription = {
  predictionAdded: {
    subscribe: () => pubsubClient.asyncIterator(['PREDICTION_ADDED']),
  },
};

export default subscription;
