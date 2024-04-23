import config from '@config';
import pino from 'pino';

const log = pino({
  level: config.logLevel,
});

export default log;
