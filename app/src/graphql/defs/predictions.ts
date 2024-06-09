import {
  generateTextPredictionStreaming,
  generateVisualPrediction,
} from '@controllers/prediction';
import { StaticGraphQLModule } from '@graphql';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';

export const PredictionModule: StaticGraphQLModule = {
  schema: `#graphql
    type Prediction {
      prompt: String
      context: String
      result: String
    }

    type Mutation {
      addVisualPrediction(
        subscriptionId: String!
        prompt: String!
        context: String
      ): String
      addTextPrediction(subscriptionId: String!, prompt: String!): String
    }

    type Subscription {
      visualPredictionAdded(subscriptionId: String!): Prediction
      textPredictionAdded(subscriptionId: String!): Prediction
    }
  `,

  resolvers: {
    Mutation: {
      addVisualPrediction: (_, props) => {
        generateVisualPrediction(props);

        return 'Prediction added';
      },

      addTextPrediction: (_, props) => {
        generateTextPredictionStreaming(props);

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
      textPredictionAdded: {
        subscribe: () =>
          pubsubClient.asyncIterator([SubscriptionEvent.TEXT_PREDICTION_ADDED]),
      },
    },
  },
};

export default PredictionModule;
