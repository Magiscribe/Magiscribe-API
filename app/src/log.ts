import config from '@config';
import pino from 'pino';

const targets =
  config.environment === 'dev'
    ? [
        {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'hostname,pid',
          },
        },
      ]
    : [
        {
          level: config.logLevel,
          target: 'pino/file',
        },
      ];

const log = pino({
  transport: { targets },
});

export default log;
