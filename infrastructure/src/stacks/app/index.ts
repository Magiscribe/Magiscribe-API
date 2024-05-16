import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { SecretsmanagerSecret } from '@cdktf/provider-aws/lib/secretsmanager-secret';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Cluster } from '@constructs/cluster';
import { HostedZone } from '@constructs/hosted-zone';
import { LoadBalancer } from '@constructs/loadbalancer';
import { PythonFunction } from '@constructs/python-function';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

interface AppStackProps {
  vpc: VPCConstruct;
  domainName: string;
  zone: HostedZone;
  githubContainerSecret: SecretsmanagerSecret;
  executorFn: PythonFunction;
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
      key: `${id}.tfstate`,
    });

    Aspects.of(this).add(
      new TagsAddingAspect({
        stack: id,
      }),
    );

    /*================= ECS =================*/

    const cluster = new Cluster(this, 'Cluster');

    const task = cluster.runDockerImage({
      name: 'executor',
      image: 'ghcr.io/magiscribe/poc-graphql:latest',
      env: {
        PORT: '80',
        EXECUTOR_LAMBDA_NAME: config.executorFn.function.functionName,
      },
      secret: config.githubContainerSecret,
    });

    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc: config.vpc.vpc,
      cluster: cluster.cluster,
      certificate: config.zone.defaultCertificate,
    });

    const serviceSecurityGroup = new SecurityGroup(
      this,
      `service-security-group`,
      {
        vpcId: config.vpc.vpc.vpcIdOutput,
        // Only allow incoming traffic from our load balancer
        ingress: [
          {
            protocol: 'TCP',
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
            protocol: '-1',
            cidrBlocks: ['0.0.0.0/0'],
            ipv6CidrBlocks: ['::/0'],
          },
        ],
      },
    );

    loadBalancer.exposeService('executor', task, serviceSecurityGroup, '/');

    new Route53Record(this, 'FrontendRecord', {
      name: config.domainName,
      zoneId: config.zone.zone.zoneId,
      type: 'CNAME',
      records: [loadBalancer.lb.dnsName],
      ttl: 60,
    });
  }
}
