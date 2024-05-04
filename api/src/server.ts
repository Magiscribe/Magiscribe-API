import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import log from '@log';
import resolvers from '@resolvers';
import typeDefs from '@types';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import config from '@config';

export default async function startServer(port: number) {
  // Create schema, which will be used separately by ApolloServer and
  // the WebSocket server.
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Standard http server for queries and mutations.
  const app = express();
  const httpServer = createServer(app);

  // Set up WebSocket server for subscriptions.
  const websocketServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Clean up the WebSocket server when the HTTP server is shut down.
  const serverCleanup = useServer({ schema }, websocketServer);

  /*================================ PLUGINS ==============================*/

  // Proper shutdown for the WebSocket server.
  const pluginDrainWebSocketServer = {
    async serverWillStart() {
      return {
        async drainServer() {
          await serverCleanup.dispose();
        },
      };
    },
  };

  // Proper shutdown for the HTTP server.
  const pluginDraiHttpServer = ApolloServerPluginDrainHttpServer({
    httpServer,
  });

  const pluginDisableLandingPage =
    config.environment === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : {};

  // Logging plugin.
  const pluginLogging = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
      requestContext.logger = log.child({
        requestId: requestContext.request.http?.headers.get('x-request-id'),
      });
      requestContext.logger.trace({
        operationName: requestContext.request.operationName,
        query: requestContext.request.query,
        variables: requestContext.request.variables,
      });

      return {
        // Fires whenever Apollo Server will validate a
        // request's document AST against your GraphQL schema.
        async didEncounterErrors({ logger, errors }) {
          errors.forEach((error) => logger.warn(error));
        },
      };
    },
  };

  /*=============================== SERVER ==============================*/

  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    plugins: [
      pluginDrainWebSocketServer,
      pluginDraiHttpServer,
      pluginLogging,
      pluginDisableLandingPage,
    ],

    // We do not want to enable introspection in production.
    // introspection enables you to query a GraphQL server for information about the underlying schema.
    // This is useful for debugging, but can be a security risk in production as it can reveal
    // implementation details about your schema.
    // For more information, see https://www.apollographql.com/blog/why-you-should-disable-graphql-introspection-in-production.
    introspection: config.environment !== 'production',
  });

  await server.start();

  /*=============================== ROUTES ==============================*/

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server),
  );

  // So that we can check if the server is running.
  app.get('/health', (_req, res) => {
    res.status(200).send('🆗');
  });

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(port, () => {
    log.info(`Query endpoint ready at http://localhost:${port}/graphql`);
    log.info(`Subscription endpoint ready at ws://localhost:${port}/graphql`);
  });
}
