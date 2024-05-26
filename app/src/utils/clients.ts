import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { S3Client } from '@aws-sdk/client-s3';
import { STSClient } from '@aws-sdk/client-sts';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import config from '@config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as AWSXRay from 'aws-xray-sdk';

// Sets up the pub sub client to use Redis if the configuration is set,
// otherwise it uses the default PubSub client.
const pubsubClient = new RedisPubSub({
  connection: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

// AWS Clients
const credentials =
  config.aws.accessKeyId && config.aws.secretAccessKey
    ? {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      }
    : undefined;

const s3Client = AWSXRay.captureAWSv3Client(
  new S3Client({
    credentials,
    region: config.aws.region,
  }),
);
const bedrockClient = AWSXRay.captureAWSv3Client(
  new BedrockRuntimeClient({
    credentials,
  }),
);
const lambdaClient = AWSXRay.captureAWSv3Client(
  new LambdaClient({
    credentials,
    endpoint: config.lambda.endpoint,
    region: config.aws.region,
  }),
);
const stsClient = AWSXRay.captureAWSv3Client(
  new STSClient({
    credentials,
  }),
);
const transcribeClient = AWSXRay.captureAWSv3Client(
  new TranscribeClient({
    credentials,
    region: config.aws.region,
  }),
);

export {
  bedrockClient,
  lambdaClient,
  pubsubClient,
  s3Client,
  stsClient,
  transcribeClient,
};
