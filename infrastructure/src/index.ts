import { App } from 'cdktf';
import * as dotenv from 'dotenv';
import AppStack from 'stacks/app';
import FrontendStack from 'stacks/client';
import LambdaStack from 'stacks/lambda';
import NetworkStack from 'stacks/network';

// Dotenv configuration
dotenv.config();

const app = new App();

const apexDomainName = process.env.DOMAIN || 'magiscribe.com';

// Stack definitions
const network = new NetworkStack(app, 'network', {
  apexDomainName,
});

const lambdas = new LambdaStack(app, 'lambdas');

new AppStack(app, 'app', {
  vpc: network.vpc,
  zone: network.hostedZone,
  githubContainerSecret: network.githubContainerSecret,
  executorFn: lambdas.executorFn,
});

new FrontendStack(app, 'frontend', {
  domainName: apexDomainName,
  zone: network.hostedZone,
});

app.synth();
