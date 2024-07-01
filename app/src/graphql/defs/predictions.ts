import { generatePrediction } from '@controllers/prediction';
import { StaticGraphQLModule } from '@graphql';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';
import { withFilter } from 'graphql-subscriptions';

export const PredictionModule: StaticGraphQLModule = {
  schema: `#graphql
    enum PredictionType {
      ERROR
      DATA
      SUCCESS
      RECIEVED
    }

    type Prediction {
      id: String
      prompt: String
      context: String
      result: String
      type: String
    }
    
    type Mutation {
      addPrediction(
        subscriptionId: String!
        agentId: String!
        prompt: String!
        context: String
      ): String
    }

    type Subscription {
      visualPredictionAdded(subscriptionId: String!): Prediction
    }
  `,

  resolvers: {
    Mutation: {
      addPrediction: (_, props, context) => {
        generatePrediction({
          variables: {
            prompt: props.prompt,
            context: props.context,
          },
          subscriptionId: props.subscriptionId,
          agentId: props.agentId,
          user: context.auth,
        });

        return 'Prediction added';
      },
    },
    Subscription: {
      visualPredictionAdded: {
        subscribe: withFilter(
          () => pubsubClient.asyncIterator(SubscriptionEvent.PREDICTION_ADDED),
          (payload, variables) =>
            payload.visualPredictionAdded.subscriptionId ===
            variables.subscriptionId,
        ),
      },
    },
  },
};

export default PredictionModule;
