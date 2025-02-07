import config from '@/config';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';
import { createClerkClient } from '@clerk/backend';
import { PubSub } from 'graphql-subscriptions';
import Stripe from 'stripe';

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
const sqsClient = new SQSClient();
const sesClient = new SESClient();
const lambdaClient = new LambdaClient({
  endpoint: config.lambda.endpoint,
});

/*================================ Stripe ==============================*/

const stripe = new Stripe(config.stripe.secretKey!);

/*================================ CLERK ==============================*/

const clerkClient = createClerkClient({ secretKey: config.auth.secretKey });

export {
  sqsClient,
  sesClient,
  lambdaClient,
  pubsubClient,
  s3Client,
  clerkClient,
  stripe,
};
