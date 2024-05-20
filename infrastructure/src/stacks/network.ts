import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { HostedZone } from '@constructs/hosted-zone';
import { VPCConstruct } from '@constructs/vpc';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';
import config from '../../bin/config';

interface NetworkStackProps {
  apexDomainName: string;
}

export default class NetworkStack extends TerraformStack {
  readonly hostedZone: HostedZone;
  readonly vpc: VPCConstruct;

  constructor(scope: Construct, id: string, props: NetworkStackProps) {
    super(scope, id);

    const { apexDomainName: domainName } = props;

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

    this.hostedZone = new HostedZone(this, 'Zone', {
      domainName,
    });

    this.vpc = new VPCConstruct(this, 'VPC', {
      vpcCidrMask: 16,
      publicCidrMask: 20,
      privateCidrMask: 20,
      isolatedCidrMask: 20,
    });
  }
}
