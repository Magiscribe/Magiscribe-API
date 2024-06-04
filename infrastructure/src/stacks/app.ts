import { ElasticacheReplicationGroup } from '@cdktf/provider-aws/lib/elasticache-replication-group';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { DNSZone } from '@constructs/dns-zone';
import { Cluster } from '@constructs/ecs-cluster';
import { Repository } from '@constructs/ecs-repository';
import { PythonFunction } from '@constructs/function';
import { LoadBalancer } from '@constructs/loadbalancer';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack, Token } from 'cdktf';
import { Construct } from 'constructs';
import config from '../../bin/config';
import { ElasticacheSubnetGroup } from '@cdktf/provider-aws/lib/elasticache-subnet-group';

interface AppStackProps {
  vpc: VPCConstruct;
  domainName: string;
  zone: DNSZone;
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

    /*================= REDIS =================*/

    // Note: Redis is being kept in the application stack since it is only used for session management.
    //       If Redis is used for other purposes, it should be moved to a separate stack for better isolation.

    const subnetGroup = new ElasticacheSubnetGroup(this, 'RedisSubnetGroup', {
      name: 'redis-subnet-group',
      subnetIds: Token.asList(props.vpc.vpc.privateSubnetsOutput),
    });

    const secucrityGroup = new SecurityGroup(this, 'RedisSecurityGroup', {
      vpcId: props.vpc.vpc.vpcIdOutput,
      ingress: [
        // Grants ingress to Redis from resources within the VPC.
        // TODO: Update the CIDR block to allow only the resources that need access to Redis.
        {
          protocol: 'tcp',
          fromPort: 6379,
          toPort: 6379,
          cidrBlocks: [props.vpc.vpc.vpcCidrBlockOutput],
        },
      ],
    });

    const redis = new ElasticacheReplicationGroup(this, 'Redis', {
      replicationGroupId: 'redis-replication-group',
      description: 'Redis replication group',
      engine: 'redis',
      subnetGroupName: subnetGroup.name,
      nodeType: 'cache.t3.micro',

      parameterGroupName: 'default.redis7',
      securityGroupIds: [secucrityGroup.id],
      port: 6379,
    });

    /*================= ECS =================*/

    const cluster = new Cluster(this, 'Cluster');

    const task = cluster.runDockerImage({
      name: 'graphql-api',
      image: `${props.repositoryApp.repository.repositoryUrl}:latest`,
      env: {
        PORT: '80',
        LAMBDA_PYTHON_EXECUTOR_NAME: executorFn.function.functionName,
        CLERK_PUBLISHABLE_KEY: config.auth.publishableKey,
        CLERK_SECRET_KEY: config.auth.secretKey,
        REDIS_HOST: redis.primaryEndpointAddress,
        REDIS_PORT: redis.port.toString(),
        CORS_ORIGINS:
          'https://api.magiscribe.com,https://*.magiscribe.com,https://app.magiscribe.com',
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
