import { generatePrediction } from '@controllers/prediction';
import { MutationAddPredictionArgs } from '@graphql/codegen';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';
import { withFilter } from 'graphql-subscriptions';

export default {
  Mutation: {
    addPrediction: (_, props: MutationAddPredictionArgs, context) => {
      if (!props.subscriptionId || !props.agentId) {
        throw new Error('Subscription ID and Agent ID are required');
      }

      // Subscription ID and Agent ID are special fields, everything else is
      // used as context for the agent.
      const { subscriptionId, agentId, variables, attachments } = props;

      generatePrediction({
        variables,
        attachments: attachments ?? [],
        subscriptionId,
        agentId,
        auth: context.auth,
      });

      return 'Prediction added';
    },
  },
  Subscription: {
    predictionAdded: {
      subscribe: withFilter(
        () => pubsubClient.asyncIterator(SubscriptionEvent.PREDICTION_ADDED),
        (payload, variables) =>
          payload.predictionAdded.subscriptionId === variables.subscriptionId,
      ),
    },
  },
};
