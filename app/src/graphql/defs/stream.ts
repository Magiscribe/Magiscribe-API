import { Stream } from '@database/models/stream';
import { StaticGraphQLModule } from '@graphql';
import log from '@log';
import { pubsubClient } from '@utils/clients';
import { withFilter } from 'graphql-subscriptions';
import { GraphQLJSONObject } from 'graphql-type-json';

export const StreamModule: StaticGraphQLModule = {
  schema: `#graphql
        scalar JSONObject

        type StreamObject {
            subscriptionId: String!
            data: JSONObject!
        }

        type Mutation {
            createStreamObject(subscriptionId: String! data: JSONObject!): StreamObject!
        }

        type Query {
            streamObject(subscriptionId: String!): StreamObject!
        }

        type Subscription {
            streamObject(subscriptionId: String!): StreamObject!
        }
    `,
  resolvers: {
    JSONObject: GraphQLJSONObject,
    Mutation: {
      async createStreamObject(_, streamObject) {
        log.info({
          msg: 'Stream object created',
          streamObject,
        });
        await Stream.updateOne(
          { subscriptionId: streamObject.subscriptionId },
          { data: streamObject.data },
          { upsert: true },
        );
        pubsubClient.publish('STREAM_OBJECT', streamObject);
        return streamObject;
      },
    },
    Query: {
      async streamObject(_, { subscriptionId }) {
        const stream = await Stream.findOne({ subscriptionId });
        return stream;
      },
    },
    Subscription: {
      streamObject: {
        subscribe: withFilter(
          () => pubsubClient.asyncIterator('STREAM_OBJECT'),
          (payload, variables) =>
            payload.subscriptionId === variables.subscriptionId,
        ),
        resolve: (payload) => payload,
      },
    },
  },
};
