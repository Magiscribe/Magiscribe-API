import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import resolvers from './resolvers';
import typeDefs from './types';

const PORT = process.env.PORT || 3000;

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.start().then(() => {
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
});
