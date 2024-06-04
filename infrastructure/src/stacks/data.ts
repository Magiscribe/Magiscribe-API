import { ElasticacheReplicationGroup } from '@cdktf/provider-aws/lib/elasticache-replication-group';
import { ElasticacheSubnetGroup } from '@cdktf/provider-aws/lib/elasticache-subnet-group';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { Repository } from '@constructs/ecs-repository';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack, Token } from 'cdktf';
import { Construct } from 'constructs';
import config from '../../bin/config';
import { SecurityGroup } from '@cdktf/provider-aws/lib/security-group';

interface DataStackProps {
  vpc: VPCConstruct;
}

export default class DataStack extends TerraformStack {
  readonly s3Bucket: S3Bucket;
  readonly redis: ElasticacheReplicationGroup;
  readonly repositoryPythonExecutor: Repository;
  readonly repositoryApp: Repository;

  constructor(scope: Construct, id: string, props: DataStackProps) {
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

    /*================= S3 =================*/

    this.s3Bucket = new S3Bucket(this, 'MediaAssets', {
      bucketPrefix: 'media-assets-',
    });

    /*================= REDIS =================*/

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

    this.redis = new ElasticacheReplicationGroup(this, 'Redis', {
      replicationGroupId: 'redis-replication-group',
      description: 'Redis replication group',
      engine: 'redis',
      subnetGroupName: subnetGroup.name,
      nodeType: 'cache.t3.micro',

      parameterGroupName: 'default.redis7',
      securityGroupIds: [secucrityGroup.id],
      port: 6379,
    });

    /*================= ECR =================*/

    this.repositoryPythonExecutor = new Repository(this, 'PythonExecutor', {
      name: 'python-executor',
    });

    this.repositoryApp = new Repository(this, 'App', {
      name: 'graphql-api',
    });
  }
}
