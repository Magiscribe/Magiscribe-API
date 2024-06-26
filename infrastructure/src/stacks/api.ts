import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';
import { Cluster } from '@constructs/ecs-cluster';
import { PythonFunction } from '@constructs/function';
import { LoadBalancer } from '@constructs/loadbalancer';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import config from '../../bin/config';
import DataStack from './data';
import NetworkStack from './network';

interface ApiStackProps {
  network: NetworkStack;
  domainName: string;
  corsOrigins: string[];
  data: DataStack;
}

export default class ApiStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    const { network, domainName, data } = props;

    /*================= PROVIDERS =================*/

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

    const executorFn = new PythonFunction(this, 'PythonExecutor', {
      imageUri: `${data.repositoryPythonExecutor.repository.repositoryUrl}:latest`,
      timeout: 10,
      memorySize: 1024,
    });

    /*================= REDIS =================*/

    // Note: Redis is being kept in the application stack since it is only used for session management.
    //       If Redis is used for other purposes, it should be moved to a separate stack for better isolation.

    // TODO: Enable this once we scale beyond a single container.
    // const redis = new RedisConstruct(this, 'Redis', {
    //   vpc: network.vpc.vpc,
    // });

    /*================= ECS =================*/

    const cluster = new Cluster(this, 'Cluster');

    const task = cluster.runDockerImage({
      name: 'graphql-api',
      image: `${data.repositoryApp.repository.repositoryUrl}:latest`,
      env: {
        PORT: '80',
        LAMBDA_PYTHON_EXECUTOR_NAME: executorFn.function.functionName,
        CLERK_PUBLISHABLE_KEY: config.auth.publishableKey,
        CLERK_SECRET_KEY: config.auth.secretKey,
        CORS_ORIGINS: props.corsOrigins.join(','),

        // TODO: Enable this once we scale beyond a single container.
        // REDIS_HOST: redis.replicationGroup.primaryEndpointAddress,
        // REDIS_PORT: redis.replicationGroup.port.toString(),
      },
      secrets: {
        MONGODB_URL: data.databaseParameters.connectionString.arn,
        MONGODB_USERNAME: data.databaseParameters.user.arn,
        MONGODB_PASSWORD: data.databaseParameters.password.arn,
      },
    });

    const loadBalancer = new LoadBalancer(this, 'LoadBalancer', {
      vpc: network.vpc.vpc,
      cluster: cluster.cluster,
      certificate: network.dns.defaultCertificate,
    });

    const serviceSecurityGroup = new SecurityGroup(
      this,
      `service-security-group`,
      {
        vpcId: network.vpc.vpc.vpcIdOutput,
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

    loadBalancer.exposeService({
      name: 'graphql-api',
      task,
      serviceSecurityGroup,
      path: '/',
    });

    new Route53Record(this, 'FrontendRecord', {
      name: domainName,
      zoneId: network.dns.zone.zoneId,
      type: 'CNAME',
      records: [loadBalancer.lb.dnsName],
      ttl: 60,
    });
  }
}
