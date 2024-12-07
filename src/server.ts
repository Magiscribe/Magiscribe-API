import { ApolloServer, ApolloServerPlugin, BaseContext } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import {
  fastifyApolloDrainPlugin,
  fastifyApolloHandler,
} from '@as-integrations/fastify';
import { createClerkClient, verifyToken } from '@clerk/backend';
import config from '@config';
import database from '@database';
import fastifyCors from '@fastify/cors';
import { schema } from '@graphql';
import log from '@log';
import fastify, { FastifyInstance } from 'fastify';
import { Context } from 'graphql-ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';

/**
 * Starts the GraphQL server using Fastify.
 */
export default async function startServer() {
  log.debug(
    'Preparing thrusters, getting ready to launch (setting up schema and resolvers)...',
  );

  /*=============================== Auth ==============================*/

  const clerkClient = createClerkClient({ secretKey: config.auth.secretKey });

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
      const auth = await verifyToken(token, {
        secretKey: config.auth.secretKey,
      });
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

  // Fastify server for queries and mutations.
  const app: FastifyInstance = fastify();

  // WebSocket server for subscriptions.
  const websocketServer = new WebSocketServer({
    server: app.server,
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

  // Proper shutdown for the Fastify server.
  const pluginDrainFastifyServer = fastifyApolloDrainPlugin(app);
  plugins.push(pluginDrainFastifyServer);

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

  await app.register(fastifyCors, {
    origin: (origin, cb) => {
      if (origin === undefined) {
        // If the origin is undefined, we treat it as a same-origin request
        // or a request with no origin (such as a curl request or a request from a mobile app).
        cb(null, true);
      } else if (config.networking.corsOrigins.join(', ').trim() == '') {
        // If there are no origins specified, we allow all origins.
        cb(null, true);
      } else if (config.networking.corsOrigins.includes(origin)) {
        // If the origin is in the list of allowed origins, we allow it.
        cb(null, true);
      } else {
        log.warn(`Origin ${origin} not allowed by CORS`);
        cb(new Error('Not allowed by CORS'), false);
      }
    },
  });

  app.register(async (fastify) => {
    fastify.route({
      url: '/graphql',
      method: ['GET', 'POST', 'OPTIONS'],
      handler: fastifyApolloHandler(server, {
        context: async (request) => {
          const token = request.headers.authorization as string;
          return authorizeConnection(token, 'HTTP');
        },
      }),
    });
  });

  // Health check route
  app.get('/health', async (_request, reply) => {
    reply.status(200).send('🆗');
  });

  // Start the server
  try {
    await app.listen({ port: config.networking.port, host: '0.0.0.0' });
    log.info('We have lift off! (Server is now running)');
    log.info(
      `Query endpoint ready at http://localhost:${config.networking.port}/graphql`,
    );
    log.info(
      `Subscription endpoint ready at ws://localhost:${config.networking.port}/graphql`,
    );
  } catch (err) {
    log.error(err);
    process.exit(1);
  }
}
