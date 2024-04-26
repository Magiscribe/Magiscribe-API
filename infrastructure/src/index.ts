import { App } from 'cdktf';
import * as dotenv from 'dotenv';
import AppStack from 'stacks/app';
import FrontendStack from 'stacks/frontend';
import NetworkStack from 'stacks/network';

// Dotenv configuration
dotenv.config();

const app = new App();

const apexDomainName = process.env.DOMAIN || 'container.magiscribe.com';

// Stack definitions
const network = new NetworkStack(app, 'network', {
  apexDomainName,
});

new AppStack(app, 'app', {
  vpc: network.vpc,
  zone: network.hostedZone,
  githubContainerSecret: network.githubContainerSecret,
});

new FrontendStack(app, 'frontend', {
  domainName: apexDomainName,
  zone: network.hostedZone,
});

app.synth();
