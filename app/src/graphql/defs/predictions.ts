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
      id: String!
      subscriptionId: String!
      type: String!
      context: String
      result: String
    }
    
    type Mutation {
      addPrediction(
        subscriptionId: String!
        agentId: String!
        userMessage: String!
        context: String
      ): String
    }

    type Subscription {
      predictionAdded(subscriptionId: String!): Prediction
    }
  `,

  resolvers: {
    Mutation: {
      addPrediction: (_, props, context) => {
        generatePrediction({
          variables: {
            userMessage: props.userMessage,
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
      predictionAdded: {
        subscribe: withFilter(
          () => pubsubClient.asyncIterator(SubscriptionEvent.PREDICTION_ADDED),
          (payload, variables) =>
            payload.predictionAdded.subscriptionId === variables.subscriptionId,
        ),
      },
    },
  },
};

export default PredictionModule;
