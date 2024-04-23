import { pubsubClient } from '@utils/clients';

export enum SubscriptionEvents {
  VISUAL_PREDICTION_ADDED = 'VISUAL_PREDICTION_ADDED',
  TEXT_PREDICTION_ADDED = 'TEXT_PREDICTION_ADDED',
}

const subscription = {
  visualPredictionAdded: {
    subscribe: () =>
      pubsubClient.asyncIterator([SubscriptionEvents.VISUAL_PREDICTION_ADDED]),
  },
  textPredictionAdded: {
    subscribe: () =>
      pubsubClient.asyncIterator([SubscriptionEvents.TEXT_PREDICTION_ADDED]),
  },
};

export default subscription;
