import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { SecretsmanagerSecret } from '@cdktf/provider-aws/lib/secretsmanager-secret';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Cluster } from '@constructs/cluster';
import { LoadBalancer } from '@constructs/loadbalancer';
import { PythonFunction } from '@constructs/python-function';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import * as path from 'path';

interface AppStackProps {
  vpc: VPCConstruct;
  // domain: string;
  // zone: HostedZone;
  // authentication: Authentication;
}

export default class AppStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: AppStackProps) {
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
      key: 'api.tfstate',
    });

    Aspects.of(this).add(
      new TagsAddingAspect({
        createdBy: 'cdktf',
        project: 'whiteboard',
        stack: 'app',
      }),
    );

    /*================= LAMBDAS =================*/

    const executorFn = new PythonFunction(this, 'ExecutorFn', {
      handler: 'main.handler',
      path: `${path.resolve(__dirname)}/lambdas/python-executor`,
      timeout: 10,
      memorySize: 1024,
      layers: [
        'arn:aws:lambda:us-east-1:336392948345:layer:AWSSDKPandas-Python312-Arm64:6',
      ],
    });

    /*================= ECS =================*/

    const cluster = new Cluster(this, 'Cluster');

    // Creates a secret for out image
    const secret = new SecretsmanagerSecret(this, 'ecs-secret', {
      name: 'ecs-secret',
    });

    const task = cluster.runDockerImage({
      name: 'executor',
      image: 'ghcr.io/ai-whiteboard/poc-apollo-graphql-api:latest',
      env: { SECRET_ARN: secret.arn },
      secret,
    });

    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc: config.vpc.vpc,
      cluster: cluster.cluster,
    });

    const serviceSecurityGroup = new SecurityGroup(
      this,
      `service-security-group`,
      {
        vpcId: config.vpc.vpc.vpcIdOutput,
        // Only allow incoming traffic from our load balancer
        ingress: [
          {
            protocol: "TCP",
            fromPort: 80,
            toPort: 80,
            securityGroups: loadBalancer.lb.securityGroups,
          },
        ],
        // Allow all outgoing traffic
        egress: [
          {
            fromPort: 0,
            toPort: 0,
            protocol: "-1",
            cidrBlocks: ["0.0.0.0/0"],
            ipv6CidrBlocks: ["::/0"],
          },
        ],
      }
    );

    loadBalancer.exposeService('executor', task, serviceSecurityGroup, '/');
  }
}
