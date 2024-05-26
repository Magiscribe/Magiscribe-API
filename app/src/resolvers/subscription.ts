import { pubsubClient } from '@utils/clients';

export enum SubscriptionEvent {
  VISUAL_PREDICTION_ADDED = 'VISUAL_PREDICTION_ADDED',
  TEXT_PREDICTION_ADDED = 'TEXT_PREDICTION_ADDED',
}

const subscription = {
  visualPredictionAdded: {
    subscribe: () =>
      pubsubClient.asyncIterator([SubscriptionEvent.VISUAL_PREDICTION_ADDED]),
  },
  textPredictionAdded: {
    subscribe: () =>
      pubsubClient.asyncIterator([SubscriptionEvent.TEXT_PREDICTION_ADDED]),
  },
};

export default subscription;
