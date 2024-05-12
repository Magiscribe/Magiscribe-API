import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { IamRolePolicyAttachment } from '@cdktf/provider-aws/lib/iam-role-policy-attachment';
import { LambdaFunction } from '@cdktf/provider-aws/lib/lambda-function';
import { LambdaPermission } from '@cdktf/provider-aws/lib/lambda-permission';
import { AssetType, TerraformAsset } from 'cdktf';
import { Construct } from 'constructs';
import { buildSync } from 'esbuild';
import * as path from 'path';
import { Hash, createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface NodejsFunctionProps {
  handler: string;
  path: string;
  timeout?: number;
  entrypoints?: string[];
  externalDependencies?: string[];
  environmentVariables?: { [key: string]: string };
  layers?: string[];
  memorySize?: number;
}

/**
 * Creates hash of given files/folders. Used to conditionally deploy custom
 * resources depending if source files have changed
 */
export function computeMetaHash(paths: string[], inputHash?: Hash) {
  const hash = inputHash ? inputHash : createHash('sha1');
  for (const path of paths) {
    const statInfo = statSync(path);
    if (statInfo.isDirectory()) {
      const directoryEntries = readdirSync(path, { withFileTypes: true });
      const fullPaths = directoryEntries.map((e) => join(path, e.name));
      // recursively walk sub-folders
      computeMetaHash(fullPaths, hash);
    } else {
      const statInfo = statSync(path);
      // compute hash string name:size:mtime
      const fileInfo = `${path}:${statInfo.size}:${statInfo.mtimeMs}`;
      hash.update(fileInfo);
    }
  }
  // if not being called recursively, get the digest and return it as the hash result
  if (!inputHash) {
    return hash.digest().toString('base64');
  }
  return;
}

const bundle = (
  id: string,
  workingDirectory: string,
  entrypoints?: string[],
) => {
  const outdir = `${path.join(process.cwd(), 'cdktf.out', 'dist', id)}`;

  buildSync({
    entryPoints: entrypoints ?? ['index.ts'],
    platform: 'node',
    target: 'es2018',
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir,
    absWorkingDir: workingDirectory,
    external: [], // Include all dependencies in the bundle
    nodePaths: [path.resolve(path.join(process.cwd(), 'node_modules'))],
  });

  return outdir;
};

export class NodejsFunction extends Construct {
  public readonly handler: string;
  public readonly asset: TerraformAsset;
  public readonly function: LambdaFunction;
  public readonly role: IamRole;

  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id);

    this.handler = props.handler;

    const workingDirectory = path.resolve(props.path);
    const distPath = bundle(id, workingDirectory, props.entrypoints);

    this.asset = new TerraformAsset(this, 'lambda-asset', {
      path: distPath,
      type: AssetType.ARCHIVE,
    });

    this.role = new IamRole(this, 'lambda-role', {
      name: `${id}-role`,
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
      runtime: 'nodejs20.x',
      timeout: props.timeout,
      layers: props.layers,
      filename: this.asset.path,
      memorySize: props.memorySize,
      sourceCodeHash: computeMetaHash([workingDirectory]),
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
