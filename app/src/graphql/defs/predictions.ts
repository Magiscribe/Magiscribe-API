import { generateVisualPrediction } from '@controllers/prediction';
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
      prompt: String
      context: String
      result: String
      type: String
    }
    
    type Mutation {
      addVisualPrediction(
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
      addVisualPrediction: (_, props) => {
        generateVisualPrediction(props);

        return 'Prediction added';
      },
    },
    Subscription: {
      visualPredictionAdded: {
        subscribe: () =>
          pubsubClient.asyncIterator([
            SubscriptionEvent.VISUAL_PREDICTION_ADDED,
          ]),
      },
    },
  },
};

export default PredictionModule;
