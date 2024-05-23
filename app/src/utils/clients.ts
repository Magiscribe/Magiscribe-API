import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from '@aws-sdk/client-lambda';
import config from '@config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';

// Sets up the pub sub client to use Redis if the configuration is set,
// otherwise it uses the default PubSub client.
const pubsubClient = config.redis
  ? new RedisPubSub({
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
    })
  : new PubSub();

// AWS Clients
const credentials = config.aws.accessKeyId && config.aws.secretAccessKey ? {
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
} : undefined;

const bedrockClient = new BedrockRuntimeClient({
  credentials
});
const lambdaClient = new LambdaClient({
  credentials,
  endpoint: config.lambda.endpoint,
  region: config.aws.region,
});

export { bedrockClient, lambdaClient, pubsubClient };
