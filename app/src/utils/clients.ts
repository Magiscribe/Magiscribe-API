import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from '@aws-sdk/client-lambda';
import config from '@config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';

// Sets up the pub sub client to use Redis if the configuration is set,
// otherwise it uses the default PubSub client.
const pubsubClient = config.redis ? new RedisPubSub({
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
}): new PubSub();

// AWS Clients
const bedrockClient = new BedrockRuntimeClient();
const lambdaClient = new LambdaClient({
  endpoint: config.lambda.endpoint,
  region: config.aws.region,
  logger: console,
});

export { bedrockClient, lambdaClient, pubsubClient };
