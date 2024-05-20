const config = {
  /**
   * The AWS region the CDKTF stack will be deployed to (e.g. us-east-1)
   */
  region: process.env.CDKTF_REGION || 'us-east-1',

  /**
   * The Terraform backend configuration.
   * This is used to store the Terraform state file.
   */
  terraformBackend: {
    /**
     * The S3 bucket name to store the Terraform state file.
     */
    bucket: process.env.CDKTF_BUCKET_NAME || '',

    /**
     * The DynamoDB table name to store the Terraform state lock.
     */
    dynamodbTable: process.env.CDKTF_DYNAMODB_TABLE || '',

    /**
     * The AWS region the S3 bucket and DynamoDB table will be created in.
     * @default 'us-east-1'
     */
    region: process.env.CDKTF_REGION || 'us-east-1',
  },

  dns: {
    apexDomainName: process.env.APEX_DOMAIN || 'magiscribe.com',
  },
};

export default config;
