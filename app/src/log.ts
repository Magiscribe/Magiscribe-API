import config from '@config';
import pino from 'pino';

const log = pino({
  level: config.logLevel,
  transport:
    config.environment == 'development'
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
