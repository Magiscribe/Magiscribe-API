import { generatePrediction } from '@controllers/prediction';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';
import { withFilter } from 'graphql-subscriptions';

export const PredictionModule = {
    Mutation: {
      addPrediction: (_, props, context) => {
        if (!props.subscriptionId || !props.agentId) {
          throw new Error('Subscription ID and Agent ID are required');
        }

        // Subscription ID and Agent ID are special fields, everything else is
        // used as context for the agent.
        const { subscriptionId, agentId, variables } = props;

        generatePrediction({
          variables,
          subscriptionId,
          agentId,
          auth: context.auth,
        });

        return 'Prediction added';
      },
    },
    Subscription: {
      predictionAdded: {
        subscribe: () => ({
          [Symbol.asyncIterator]: withFilter(
            () =>
              pubsubClient.asyncIterator(SubscriptionEvent.PREDICTION_ADDED),
            (payload, variables) =>
              payload.predictionAdded.subscriptionId ===
              variables.subscriptionId,
          ),
        }),
      },
    },
};

export default PredictionModule;
