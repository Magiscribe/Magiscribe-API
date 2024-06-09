import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { Repository } from '@constructs/ecs-repository';
import { S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import config from '../../bin/config';
import * as mongodb from '@cdktf/provider-mongodbatlas';

export default class DataStack extends TerraformStack {
  readonly s3Bucket: S3Bucket;
  readonly repositoryPythonExecutor: Repository;
  readonly repositoryApp: Repository;
  readonly instance: mongodb.serverlessInstance.ServerlessInstance;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.region,
    });

    new mongodb.provider.MongodbatlasProvider(this, 'mongodb', {
      publicKey: config.db.publicKey,
      privateKey: config.db.privateKey,
    });

    /*  Aspects.of(this).add(
       new TagsAddingAspect({
         stack: id,
       }),
     ); */

    new S3Backend(this, {
      ...config.terraformBackend,
      key: `${id}.tfstate`,
    });

    /*================= S3 =================*/

    this.s3Bucket = new S3Bucket(this, 'MediaAssets', {
      bucketPrefix: 'media-assets-',
    });

    /*================= ECR =================*/

    this.repositoryPythonExecutor = new Repository(this, 'PythonExecutor', {
      name: 'python-executor',
    });

    this.repositoryApp = new Repository(this, 'App', {
      name: 'graphql-api',
    });

    this.instance = new mongodb.serverlessInstance.ServerlessInstance(
      this,
      'MongoDBInstance',
      {
        name: 'mongodb-instance',
        projectId: config.db.projectId,
        providerSettingsBackingProviderName: 'AWS',
        providerSettingsProviderName: 'SERVERLESS',
        providerSettingsRegionName: 'US_EAST_1',
      },
    );
  }
}
