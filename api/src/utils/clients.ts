import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { PubSub } from 'graphql-subscriptions';

const pubsubClient = new PubSub();
const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });
const lambdaClient = new LambdaClient({ region: 'us-east-1' });

export { bedrockClient, lambdaClient, pubsubClient };
