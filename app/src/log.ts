import config from '@config';
import pino from 'pino';

const log = pino({
  level: config.logLevel.toLowerCase(),
  transport:
    config.environment == 'dev'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'hostname,pid',
          },
        }
      : undefined,
});

export default log;
