import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { VPCConstruct } from '@constructs/vpc';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import { TagsAddingAspect } from 'aspects/tag-aspect';

interface NetworkStackProps {
  apexDomainName: string;
}

export default class NetworkStack extends TerraformStack {
  // readonly hostedZone: HostedZone;
  // readonly authentication: Authentication;
  readonly vpc: VPCConstruct;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id);

    const { apexDomainName: domainName } = props;

    // AWS Provider
    new AwsProvider(this, 'aws', {
      region: 'us-east-1',
    });

    Aspects.of(this).add(
      new TagsAddingAspect({
        createdBy: 'cdktf',
        project: 'whiteboard',
        stack: 'network',
      }),
    );

    new S3Backend(this, {
      bucket: process.env.CDKTF_BUCKET_NAME!,
      dynamodbTable: process.env.CDKTF_DYNAMODB_TABLE!,
      region: process.env.CDKTF_REGION!,
      key: 'network-container.tfstate',
    });

    // this.hostedZone = new HostedZone(this, 'Zone', {
    //   domainName,
    // });

    // this.authentication = new Authentication(this, 'Auth');

    this.vpc = new VPCConstruct(this, 'VPC', {
      vpcCidrMask: 16,
      publicCidrMask: 20,
      privateCidrMask: 20,
      isolatedCidrMask: 20,
    });
  }
}
