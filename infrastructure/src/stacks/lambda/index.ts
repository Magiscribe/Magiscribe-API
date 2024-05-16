import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { PythonFunction } from '@constructs/python-function';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as path from 'path';

export default class LambdaStack extends TerraformStack {
  readonly executorFn: PythonFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const region = 'us-east-1';

    // AWS Provider
    new AwsProvider(this, 'aws', {
      region,
    });

    new S3Backend(this, {
      bucket: process.env.CDKTF_BUCKET_NAME!,
      dynamodbTable: process.env.CDKTF_DYNAMODB_TABLE!,
      region: process.env.CDKTF_REGION!,
      key: 'lambda-container.tfstate',
    });

    Aspects.of(this).add(
      new TagsAddingAspect({
        stack: id,
      }),
    );

    /*================= LAMBDAS =================*/

    this.executorFn = new PythonFunction(this, 'PythonExecutorFn', {
      handler: 'main.handler',
      path: `${path.resolve(__dirname)}/lambdas/python-executor`,
      timeout: 10,
      memorySize: 1024,
      layers: [
        'arn:aws:lambda:us-east-1:336392948345:layer:AWSSDKPandas-Python312-Arm64:6',
      ],
    });
  }
}
