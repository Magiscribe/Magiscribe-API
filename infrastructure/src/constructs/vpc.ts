import { DataAwsAvailabilityZones } from '@cdktf/provider-aws/lib/data-aws-availability-zones';
import { Construct } from 'constructs';
import { Vpc } from '../../.gen/modules/vpc';

export interface VPCProps {
  vpcCidrMask: number;
  publicCidrMask: number;
  privateCidrMask: number;
  isolatedCidrMask: number;
}

export class VPCConstruct extends Construct {
  readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: VPCProps) {
    super(scope, id);

    // Get all AZs in the region
    const data = new DataAwsAvailabilityZones(this, 'azs', {
      state: 'available',
    });

    const azs = ['us-east-1a', 'us-east-1b', 'us-east-1c'];

    const cidr = `10.0.0.0/${props.vpcCidrMask}`;

    this.vpc = new Vpc(this, 'vpc', {
      cidr,
      azs: data.names,

      publicSubnetNames: azs.map((_az, i) => `public-${i}`),
      privateSubnetNames: azs.map((_az, i) => `private-${i}`),
      databaseSubnetNames: azs.map((_az, i) => `database-${i}`),

      databaseSubnetGroupName: 'database',

      publicSubnets: azs.map((_az, i) => `10.0.${i * 16}.0/20`),
      privateSubnets: azs.map(
        (_az, i) => `10.0.${i * 16 + 16 * azs.length}.0/20`,
      ),
      databaseSubnets: azs.map(
        (_az, i) => `10.0.${i * 16 + 32 * azs.length}.0/20`,
      ),

      // enableNatGateway: true,
      // singleNatGateway: true,
    });
  }
}
