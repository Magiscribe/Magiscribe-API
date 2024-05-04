const config = {
  /**
   * The port the application will run on.
   * @default 3000
   */
  port: parseInt(process.env.PORT || '3000'),

  /**
   * The log level for the application.
   * Possible values: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'
   * @default 'debug'
   */
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default config;
