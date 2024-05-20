import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Cluster } from '@constructs/ecs-cluster';
import { Repository } from '@constructs/ecs-repository';
import { PythonFunction } from '@constructs/function';
import { HostedZone } from '@constructs/hosted-zone';
import { LoadBalancer } from '@constructs/loadbalancer';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import config from '../../bin/config';
import { Construct } from 'constructs';

interface AppStackProps {
  vpc: VPCConstruct;
  domainName: string;
  zone: HostedZone;
  repositoryPythonExecutor: Repository;
  repositoryApp: Repository;
}

export default class AppStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.region,
    });

    Aspects.of(this).add(
      new TagsAddingAspect({
        stack: id,
      }),
    );

    new S3Backend(this, {
      ...config.terraformBackend,
      key: `${id}.tfstate`,
    });

    /*================= LAMBDAS =================*/

    const executorFn = new PythonFunction(this, 'PythonExecutorFn', {
      imageUri: `${props.repositoryPythonExecutor.repository.repositoryUrl}:latest`,
      timeout: 10,
      memorySize: 1024,
    });

    /*================= ECS =================*/

    const cluster = new Cluster(this, 'Cluster');

    const task = cluster.runDockerImage({
      name: 'graphql-api',
      image:`${props.repositoryApp.repository.repositoryUrl}:latest`,
      env: {
        PORT: '80',
        EXECUTOR_LAMBDA_NAME: executorFn.function.functionName,
      },
    });

    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc: props.vpc.vpc,
      cluster: cluster.cluster,
      certificate: props.zone.defaultCertificate,
    });

    const serviceSecurityGroup = new SecurityGroup(
      this,
      `service-security-group`,
      {
        vpcId: props.vpc.vpc.vpcIdOutput,
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

    loadBalancer.exposeService('graphql-api', task, serviceSecurityGroup, '/');

    new Route53Record(this, 'FrontendRecord', {
      name: props.domainName,
      zoneId: props.zone.zone.zoneId,
      type: 'CNAME',
      records: [loadBalancer.lb.dnsName],
      ttl: 60,
    });
  }
}
