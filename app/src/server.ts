import { ApolloServer, ApolloServerPlugin, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { clerkClient, ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import config from '@config';
import database from '@database';
import { schema } from '@graphql';
import log from '@log';
import cors from 'cors';
import express from 'express';
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

  const sandboxAuthToken = 'Sandbox';
  const sandboxSub = 'Sandbox';
  const sandboxRole = 'org:admin';
  const sandBoxCheck = (token: string) =>
    config.auth.sandboxBypass && token === sandboxAuthToken;

  if (config.auth.sandboxBypass) {
    log.warn(
      "Sandbox mode enabled, skipping authorization check when 'Sandbox' authorization token is provided",
    );
  }

  const authorizeConnection = async (
    token: string,
    connectionType: 'WebSocket' | 'HTTP',
  ) => {
    if (sandBoxCheck(token)) {
      return { roles: [{ role: sandboxRole }], auth: { sub: sandboxSub } };
    }

    if (!token) {
      return { roles: [], auth: null };
    }

    try {
      const auth = await clerkClient.verifyToken(token);
      const roles = (
        await clerkClient.users.getOrganizationMembershipList({
          userId: auth.sub,
        })
      ).data;
      log.debug({
        msg: 'Connection authorized',
        connectionType,
        userId: auth.sub,
      });
      return {
        auth: { sub: auth.sub },
        roles: roles.map((role) => {
          return {
            role: role.role,
            organizationId: role.organization.id,
          };
        }),
      };
    } catch {
      // Sometimes the token is invalid, so we just return an empty array if that's the case.
      return { roles: [], auth: null };
    }
  };

  /*================================ SCHEMA ==============================*/

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
      onConnect: async (ctx: Context<Record<string, unknown>>) => {
        // Unlike http/2 or http/3, parameters established over a WebSocket connection
        // can be anycase. Since the Apollo client automatically sends the authorization
        // in pascal case, we will convert it to lowercase to simplify the check.
        const token = Object.fromEntries(
          Object.entries(ctx.connectionParams || {}).map(([key, value]) => [
            key.toLowerCase(),
            value,
          ]),
        ).authorization as string;

        return authorizeConnection(token, 'WebSocket');
      },
    },
    websocketServer,
  );

  /*================================ PLUGINS ==============================*/

  log.debug('Plugging in power converters (adding plugins)...');

  const plugins: ApolloServerPlugin<BaseContext>[] = [];

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
  plugins.push(pluginDrainWebSocketServer);

  // Proper shutdown for the HTTP server.
  // This is so that we can drain the HTTP server when the server is shut down.
  // Gotta avoid those dangling connections less there be a memory leak.
  const pluginDrainHttpServer = ApolloServerPluginDrainHttpServer({
    httpServer,
  });
  plugins.push(pluginDrainHttpServer);

  // Disable the landing page in production so that we don't expose
  // any implementation details.
  const pluginDisableLandingPage =
    config.environment === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : {};
  plugins.push(pluginDisableLandingPage);

  // Sets up standard logging for the server. Largely useful for debugging,
  // but can be useful when distributed tracing is needed as well.
  const pluginLogging = {
    // Fires whenever a GraphQL request is received from a client.
    async requestDidStart(requestContext) {
      requestContext.logger = log.child({
        requestId: requestContext.request.http?.headers.get('x-request-id'),
      });

      // Filters out introspection queries from the logs so they don't clutter things up.
      if (requestContext.request.operationName !== 'IntrospectionQuery') {
        requestContext.logger.info({
          msg: 'Request received',
          context: requestContext.contextValue,
          operationName: requestContext.request.operationName,
          query: requestContext.request.query,
          variables: requestContext.request.variables,
        });
      }

      return {
        // Fires whenever Apollo Server will validate a
        // request's document AST against your GraphQL schema.
        async didEncounterErrors({ logger, errors }) {
          errors.forEach((error) => logger.warn(error));
        },
      };
    },
  };
  plugins.push(pluginLogging);

  if (config.newRelic.enabled) {
    // Performing a dynamic import here so that we don't load the New Relic
    // in the development environment (if it's not enabled).
    const { default: createNewRelicPlugin } = await import(
      '@newrelic/apollo-server-plugin'
    );
    const newRelicPlugin =
      createNewRelicPlugin() as ApolloServerPlugin<BaseContext>;
    plugins.push(newRelicPlugin);
  }

  /*=============================== DATABASE ==============================*/

  await database.init();

  /*=============================== SERVER ==============================*/

  log.debug('Starting the engines (setting up ApolloServer)...');

  // Set up ApolloServer.
  const server = new ApolloServer({
    schema,
    plugins,

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
    cors<cors.CorsRequest>({
      origin: function (origin, callback) {
        if (config.networking.corsOrigins.join(', ').trim() == '') {
          callback(null, true);
        } else if (config.networking.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          log.warn(`Origin ${origin} not allowed by CORS`);
          callback(new Error('Not allowed by CORS'));
        }
      },
    }),
    express.json({
      limit: '24mb',
    }),
    expressMiddleware(server, {
      context: ({ req }) => {
        const token = req.headers.authorization as string;
        return authorizeConnection(token, 'HTTP');
      },
    }),
    ClerkExpressWithAuth(),
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
