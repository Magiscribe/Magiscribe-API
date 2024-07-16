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
          target: 'pino/file',
        },
      ];

const log = pino({
  level: config.logLevel,
  transport: { targets },
});

export default log;
