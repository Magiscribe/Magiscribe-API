import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { PubSub } from 'graphql-subscriptions';

// GraphQL Client
// TODO: Replace with Redis PubSub so that it can be used in a distributed environment.
const pubsubClient = new PubSub();

// AWS Clients
const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });
const lambdaClient = new LambdaClient({ region: 'us-east-1' });

export { bedrockClient, lambdaClient, pubsubClient };
