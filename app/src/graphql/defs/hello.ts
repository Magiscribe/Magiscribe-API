import { StaticGraphQLModule } from '@graphql';

export const HelloModule: StaticGraphQLModule = {
  schema: `#graphql
    type Query {
      hello: String
    }
  `,

  resolvers: {
    Query: {
      hello: async () => {
        return 'Hello, World!';
      },
    },
  },
};

export default HelloModule;
