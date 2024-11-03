import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import config from '@config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PubSub } from 'graphql-subscriptions';

/*================================ Apollo ==============================*/

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

/*================================ AWS ==============================*/

const s3Client = new S3Client();
const lambdaClient = new LambdaClient({
  endpoint: config.lambda.endpoint,
});

export { lambdaClient, pubsubClient, s3Client };
