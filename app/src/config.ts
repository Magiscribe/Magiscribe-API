const config = {
  /**
   * The environment the application is running in.
   * Possible values: 'development', 'production'
   * @default 'development'
   */
  environment: process.env.NODE_ENV || 'development',

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

  lambda: {
    /**
     * The endpoint used by the Lambda client.
     */
    endpoint: process.env.LAMBDA_ENDPOINT,
  },

  /**
   * The database configuration for MongoDB.
   */
  database: {
    /**
     * The MongoDB connection string.
     */
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',

    /**
     * The MongoDB username.
     */
    username: process.env.MONGODB_USERNAME || 'root',

    /**
     * The MongoDB password.
     */
    password: process.env.MONGODB_PASSWORD || 'password',
  },
};

export default config;
