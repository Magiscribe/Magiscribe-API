import { App } from 'cdktf';
import Stage from 'stage';
import config from '../bin/config';

// Load environment variables aligning with the current environment.
// Example: if the NODE_ENV environment variable is set to 'production', the .env.production file will be loaded.
// Example: if the NODE_ENV environment variable is not set, the .env file will be loaded.
const app = new App();

new Stage(app, {
  apexDomainName: config.dns.apexDomainName,
});

app.synth();
