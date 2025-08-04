import { generatePrediction, generatePredictionWithInquiry } from '@/controllers/prediction';
import { MutationAddPredictionArgs } from '@/graphql/codegen';
import { SubscriptionEvent } from '@/graphql/subscription-events';
import { pubsubClient } from '@/utils/clients';
import { withFilter } from 'graphql-subscriptions';
import { v4 as uuid } from 'uuid';

export default {
  Mutation: {
    addPrediction: (_, props: MutationAddPredictionArgs, context) => {
      if (!props.subscriptionId || !props.agentId) {
        throw new Error('Subscription ID and Agent ID are required');
      }

      // Generate a unique correlation ID for this prediction request
      const correlationId = uuid();

      // Subscription ID and Agent ID are special fields, everything else is
      // used as context for the agent.
      const { subscriptionId, agentId, variables, attachments, inquiryId, integrationId } = props;

      // If inquiryId is provided, use the inquiry validation function
      if (inquiryId && integrationId) {
        generatePredictionWithInquiry({
          variables,
          attachments: attachments ?? [],
          subscriptionId,
          agentId,
          inquiryId,
          integrationId,
          correlationId,
          auth: context.auth,
        });
      } else {
        // Otherwise use the main function
        generatePrediction({
          variables,
          attachments: attachments ?? [],
          subscriptionId,
          agentId,
          integrationId: integrationId ?? undefined,
          correlationId,
          auth: context.auth,
        });
      }

      // Return the correlation ID and status
      return {
        status: 'Prediction initiated',
        correlationId,
      };
    },
  },
  Subscription: {
    predictionAdded: {
      subscribe: withFilter(
        () =>
          pubsubClient.asyncIterableIterator(
            SubscriptionEvent.PREDICTION_ADDED,
          ),
        (payload, variables) =>
          payload.predictionAdded.subscriptionId === variables.subscriptionId,
      ),
    },
  },
};
