import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { AssetType, TerraformAsset } from 'cdktf';
import { Construct } from 'constructs';
import * as path from 'path';

export interface PythonFunctionProps {
  handler: string;
  path: string;
  timeout?: number;
  entrypoints?: string[];
  environmentVariables?: { [key: string]: string };
  layers?: string[];
  memorySize?: number;
}

export class PythonFunction extends Construct {
  public readonly handler: string;
  public readonly asset: TerraformAsset;
  public readonly function: LambdaFunction;
  public readonly role: IamRole;

  constructor(scope: Construct, id: string, props: PythonFunctionProps) {
    super(scope, id);

    this.handler = props.handler;

    const workingDirectory = path.resolve(props.path);

    this.asset = new TerraformAsset(this, 'lambda-asset', {
      path: workingDirectory,
      type: AssetType.ARCHIVE, // if left empty it infers directory and file
    });

    this.role = new IamRole(this, 'lambda-role', {
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'lambda.amazonaws.com',
            },
            Action: 'sts:AssumeRole',
          },
        ],
      }),
    });

    this.function = new LambdaFunction(this, id, {
      functionName: id,
      role: this.role.arn,
      handler: this.handler,
      runtime: 'python3.12',
      timeout: props.timeout,
      layers: props.layers,
      filename: this.asset.path,
      sourceCodeHash: this.asset.assetHash,
      memorySize: props.memorySize,
      architectures: ['arm64'],
      tracingConfig: {
        mode: 'Active', // Enable X-Ray tracing
      },
      environment: {
        variables: props.environmentVariables,
      },
    });

    // Add AWSLambdaBasicExecutionRole
    this.attachPolicy(
      'lambda-basic-policy',
      'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    );

    // Add X-Ray tracing to the Lambda function
    this.attachPolicy(
      'lambda-xray-policy',
      'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess',
    );
  }

  public attachPolicy(id: string, policyArn: string) {
    new IamRolePolicyAttachment(this, `${id}-policy-attachment`, {
      policyArn,
      role: this.role.name,
    });
  }

  // GrantInvoke is a method that allows the Lambda function to be invoked by another AWS service
  public grantInvoke({
    principal,
    sourceArn,
  }: {
    principal: string;
    sourceArn: string;
  }) {
    new LambdaPermission(this, 'lambda-permission', {
      action: 'lambda:InvokeFunction',
      functionName: this.function.functionName,
      principal,
      sourceArn,
    });
  }
}
