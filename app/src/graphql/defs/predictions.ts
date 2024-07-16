import { generatePrediction } from '@controllers/prediction';
import { StaticGraphQLModule } from '@graphql';
import { SubscriptionEvent } from '@graphql/subscription-events';
import { pubsubClient } from '@utils/clients';
import { withFilter } from 'graphql-subscriptions';
import { GraphQLJSONObject } from 'graphql-type-json';

export const PredictionModule: StaticGraphQLModule = {
  schema: `#graphql
    scalar JSONObject

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
      result: String
    }
    
    type Mutation {
      addPrediction(
        subscriptionId: String!
        agentId: String!
        variables: JSONObject
      ): String
    }

    type Subscription {
      predictionAdded(subscriptionId: String!): Prediction
    }
  `,

  resolvers: {
    JSONObject: GraphQLJSONObject,
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
