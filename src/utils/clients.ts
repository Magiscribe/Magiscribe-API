import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { createClerkClient } from '@clerk/backend';
import config from '@/config';
import { PubSub } from 'graphql-subscriptions';
import { SNSClient } from '@aws-sdk/client-sns';

/*================================ Apollo ==============================*/

// Sets up the pub sub client.
const pubsubClient = new PubSub();

// TODO: Uncomment this when we have a Redis instance to connect to.
// const pubsubClient = config.redis
//   ? new RedisPubSub({
//       connection: {
//         host: config.redis.host,
//         port: config.redis.port,
//       },
//     })

/*================================ AWS ==============================*/

const s3Client = new S3Client();
const snsClient = new SNSClient();
const sesClient = new SESClient();
const lambdaClient = new LambdaClient({
  endpoint: config.lambda.endpoint,
});

/*================================ CLERK ==============================*/

const clerkClient = createClerkClient({ secretKey: config.auth.secretKey });

export {
  snsClient,
  sesClient,
  lambdaClient,
  pubsubClient,
  s3Client,
  clerkClient,
};
