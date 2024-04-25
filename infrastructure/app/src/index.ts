import { App } from 'cdktf';
import * as dotenv from 'dotenv';
import AppStack from 'stacks/app';
import NetworkStack from 'stacks/network';

// Dotenv configuration
dotenv.config();

const app = new App();

const apexDomainName = process.env.DOMAIN || 'magiscribe.com';

// Stack definitions
const networkStack = new NetworkStack(app, 'network', {
  apexDomainName,
});

new AppStack(app, 'app', {
  vpc: networkStack.vpc,
  // domain: networkStack.hostedZone,
  // zone: networkStack.hostedZone,
  // authentication: networkStack.authentication,
});

app.synth();
