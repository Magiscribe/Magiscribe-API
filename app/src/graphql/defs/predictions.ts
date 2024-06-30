import { generatePrediction } from '@controllers/prediction';
import { StaticGraphQLModule } from '@graphql';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';

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
          ...props,
          user: context.auth,
        });

        return 'Prediction added';
      },
    },
    Subscription: {
      visualPredictionAdded: {
        subscribe: () =>
          pubsubClient.asyncIterator([SubscriptionEvent.PREDICTION_ADDED]),
      },
    },
  },
};

export default PredictionModule;
