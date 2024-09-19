import dotenv from 'dotenv';

dotenv.config();

const config = {
  /**
   * The environment the application is running in.
   * Possible values: 'dev', 'prod'
   * @default 'dev'
   */
  environment: process.env.NODE_ENV || 'dev',

  networking: {
    /**
     * The port the application will run on.
     * @default 3000
     */
    port: parseInt(process.env.PORT || '3000'),

    /**
     * The origins to allow for CORS.
     * @default []
     * @example ['https://magiscribe.com']
     */
    corsOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : [],
  },

  /**
   * The log level for the application.
   * Possible values: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'
   * @default 'debug'
   */
  logLevel: process.env.LOG_LEVEL || 'info',

  auth: {
    /**
     * Enables a sandbox mode bypass for authorization to allow for easier development.
     */
    sandboxBypass: process.env.APOLLO_SANDBOX_BYPASS === 'true',

    /**
     * The Clerk publishable key.
     */
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,

    /**
     * The Clerk secret key.
     */
    secretKey: process.env.CLERK_SECRET_KEY,
  },

  aws: {
    /**
     * The region the application is running in.
     */
    region: process.env.AWS_REGION || 'us-east-1',

    /**
     * The AWS access key ID to use for authentication with AWS services.
     */
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,

    /**
     * The AWS secret access key to use for authentication with AWS services.
     */
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

  elevenlabs: {
    /**
     * The Eleven Labs API key.
     */
    apiKey: process.env.ELEVENLABS_API_KEY,
  },

  mediaAssetsBucketName: process.env.MEDIA_ASSETS_BUCKET_NAME || 'media-assets',

  lambda: {
    /**
     * The name of the Lambda function used to execute Python code.
     */
    pythonExecutorName: process.env.LAMBDA_PYTHON_EXECUTOR_NAME,

    /**
     * The endpoint used by the Lambda client.
     * @note This can be used to emulate Lambda functions locally.
     */
    endpoint: process.env.LAMBDA_ENDPOINT,
  },

  /**
   * The database configuration for MongoDB.
   */
  mongodb: {
    /**
     * The MongoDB connection string.
     */
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017',

    /**
     * The MongoDB username.
     */
    username: process.env.MONGODB_USER || 'root',

    /**
     * The MongoDB password.
     */
    password: process.env.MONGODB_PASSWORD || 'password',
  },

  redis:
    process.env.REDIS_HOST && process.env.REDIS_PORT
      ? {
          /**
           * The Redis host.
           */
          host: process.env.REDIS_HOST,

          /**
           * The Redis port.
           */
          port: parseInt(process.env.REDIS_PORT || '6379'),
        }
      : undefined,

  newRelic: {
    /**
     * Whether New Relic is enabled.
     */
    enabled: process.env.NEW_RELIC_ENABLED,

    /**
     * The New Relic Application name.
     */
    appName: process.env.NEW_RELIC_APP_NAME,

    /**
     * The New Relic license key.
     */
    licenseKey: process.env.NEW_RELIC_LICENSE_KEY,
  },
};

export default config;
