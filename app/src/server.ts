import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { clerkClient, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import config from '@config';
import { makeExecutableSchema } from '@graphql-tools/schema';
import log from '@log';
import resolvers from '@resolvers';
import typeDefs from '@schema';
import cors from 'cors';
import express from 'express';
import { GraphQLError } from 'graphql';
import { Context } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

/**
 * Starts the GraphQL server.
 */
export default async function startServer() {
  log.debug(
    'Preparing thrusters, getting ready to launch (setting up schema and resolvers)...',
  );

  /*=============================== Auth ==============================*/

  // WebSocket authorization check.
  const onConnect = async (ctx: Context<Record<string, unknown>>) => {
    if (!ctx.connectionParams) {
      log.warn(
        'Starship denied entry (Missing connection parameters in WebSocket connection)',
      );
      throw new Error('Missing connection parameters in WebSocket connection');
    }

    const connectionParams = ctx.connectionParams;
    const token = connectionParams.authorization as string;

    log.debug(
      'Starship docked at the station (Client websocket connection established)',
    );

    if (config.auth.sandboxBypass && token === 'Sandbox') {
      log.warn(
        'Station security detail is asleep (Sandbox mode enabled, skipping authorization check for WebSocket connection)',
      );
      return {};
    }

    if (!token) {
      log.warn(
        'Starship denied entry (Missing authorization token in WebSocket connection)',
      );
      throw new Error('Missing authorization token in WebSocket connection');
    }

    const user = await clerkClient.verifyToken(token);

    log.debug(
      'Starship granted entry into the station (Client websocket connection authorized)',
    );
    return { user };
  };

  // HTTP authorization check.
  const context = async ({ req }: { req: express.Request }) => {
    const auth = req.auth;
    const token = req.headers.authorization;

    log.debug('Inbound transmission detected (Client HTTP request received)');

    if (config.auth.sandboxBypass && token === 'Sandbox') {
      log.warn(
        'Security detail is asleep (Sandbox mode enabled, skipping authorization check for HTTP request)',
      );
      return {};
    }

    if (!auth?.userId) {
      log.warn(
        'Transmission blocked (Missing authorization token in HTTP request)',
      );
      throw new GraphQLError('Missing authorization token in HTTP request');
    }

    log.debug('Transmission authorized (Client HTTP request authorized)');
    return {
      auth: auth.auth,
    };
  };

  /*================================ SCHEMA ==============================*/

  // Create schema, which will be used separately by ApolloServer and
  // the WebSocket server.
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Http server for queries and mutations.
  const app = express();
  const httpServer = createServer(app);

  // WebSocket server for subscriptions.
  const websocketServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  // Clean up the WebSocket server when the HTTP server is shut down.
  const serverCleanup = useServer(
    {
      schema,
      onConnect,
    },
    websocketServer,
  );

  /*================================ PLUGINS ==============================*/

  log.debug('Plugging in power converters (adding plugins)...');

  // Proper shutdown for the WebSocket server.
  // This is so that we cleanup websocket connections when the server is shut down.
  // Gotta avoid those dangling connections less there be a memory leak.
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
  // This is so that we can drain the HTTP server when the server is shut down.
  // Gotta avoid those dangling connections less there be a memory leak.
  const pluginDraiHttpServer = ApolloServerPluginDrainHttpServer({
    httpServer,
  });

  // Disable the landing page in production so that we don't expose
  // any implementation details.
  const pluginDisableLandingPage =
    config.environment === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : {};

  // Sets up standard logging for the server. Largely useful for debugging,
  // but can be useful when distributed tracing is needed as well.
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

  log.debug('Starting the engines (setting up ApolloServer)...');

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

  log.debug('Engines started, ready to launch (starting ApolloServer)...');

  await server.start();

  /*=============================== ROUTES ==============================*/

  log.debug('Blasting off (setting up routes)...');

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: config.networking.corsOrigins }),
    ClerkExpressWithAuth(),
    express.json(),
    expressMiddleware(server, {
      context,
    }),
  );

  // So that we can check if the server is running.
  app.get('/health', (_req, res) => {
    res.status(200).send('🆗');
  });

  // Now that our HTTP server is fully set up, actually listen.
  httpServer.listen(config.networking.port, () => {
    log.info('We have lift off! (Server is now running)');
    log.info(
      `Query endpoint ready at http://localhost:${config.networking.port}/graphql`,
    );
    log.info(
      `Subscription endpoint ready at ws://localhost:${config.networking.port}/graphql`,
    );
  });
}
