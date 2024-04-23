import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { VPCConstruct } from '@constructs/vpc';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { HostedZone } from '@constructs/hosted-zone';
import { SecretsmanagerSecret } from '@cdktf/provider-aws/lib/secretsmanager-secret';
import { Id } from "@cdktf/provider-random/lib/id";
import { RandomProvider } from '@cdktf/provider-random/lib/provider';


interface NetworkStackProps {
  apexDomainName: string;
}

export default class NetworkStack extends TerraformStack {
  readonly hostedZone: HostedZone;
  readonly vpc: VPCConstruct;
  readonly githubContainerSecret: SecretsmanagerSecret;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id);

    const { apexDomainName: domainName } = props;

    // AWS Provider
    new AwsProvider(this, 'aws', {
      region: 'us-east-1',
    });

    new RandomProvider(this, 'random')

    Aspects.of(this).add(
      new TagsAddingAspect({
        createdBy: 'cdktf',
        project: 'whiteboard',
        stack: 'network-container',
      }),
    );

    new S3Backend(this, {
      bucket: process.env.CDKTF_BUCKET_NAME!,
      dynamodbTable: process.env.CDKTF_DYNAMODB_TABLE!,
      region: process.env.CDKTF_REGION!,
      key: 'network-container.tfstate',
    });

    this.hostedZone = new HostedZone(this, 'Zone', {
      domainName,
    });

    this.vpc = new VPCConstruct(this, 'VPC', {
      vpcCidrMask: 16,
      publicCidrMask: 20,
      privateCidrMask: 20,
      isolatedCidrMask: 20,
    });

    /*================= GitHub Container Registry Connection Secret =================*/

    // Random suffix
    const randomId = new Id(this, 'GitHubContainerRegistrySecretRandomId', {
      byteLength: 8,
    }).id;

    // Ref: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/private-auth.html
    this.githubContainerSecret = new SecretsmanagerSecret(this, 'GitHubContainerRegistrySecret', {
      name: `github-container-registry-connection-secret-${randomId}`,
    });
  }
}
