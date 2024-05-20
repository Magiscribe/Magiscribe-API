import { App } from 'cdktf';
import * as dotenv from 'dotenv';
import AppStack from 'stacks/app';
import FrontendStack from 'stacks/client';
import NetworkStack from 'stacks/network';

// Dotenv configuration
dotenv.config();

const app = new App();

const apexDomainName = process.env.DOMAIN || 'magiscribe.com';

// Stack definitions
const network = new NetworkStack(app, 'network', {
  apexDomainName,
});

new AppStack(app, 'app', {
  vpc: network.vpc,
  domainName: `api.${apexDomainName}`,
  zone: network.hostedZone,
  repositoryCredentials: network.githubContainerSecret,
});

new FrontendStack(app, 'client-app', {
  domainName: `*.${apexDomainName}`,
  zone: network.hostedZone,
});

new FrontendStack(app, 'client-landing', {
  domainName: `${apexDomainName}`,
  zone: network.hostedZone,
});

app.synth();
