import { CloudfrontDistribution } from '@cdktf/provider-aws/lib/cloudfront-distribution';
import { CloudfrontOriginAccessControl } from '@cdktf/provider-aws/lib/cloudfront-origin-access-control';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy';
import { HostedZone } from '@constructs/hosted-zone';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

interface FrontendStackProps {
  domainName: string;
  zone: HostedZone;
}

export default class FrontendStack extends TerraformStack {
  constructor(scope: Construct, id: string, config: FrontendStackProps) {
    super(scope, id);

    const { zone, domainName } = config;

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

    const cloudfrontOAC = new CloudfrontOriginAccessControl(
      this,
      'CloudFrontOAC',
      {
        name: `${id}-oac`,
        description: 'Allow CloudFront to access the bucket',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    );

    const frontendBucket = new S3Bucket(this, 'FrontendBucket', {
      bucketPrefix: `${id}-bucket-`,
    });

    const cloudfrontDistribution = new CloudfrontDistribution(
      this,
      'CloudFront',
      {
        enabled: true,
        defaultRootObject: 'index.html',
        defaultCacheBehavior: {
          allowedMethods: [
            'DELETE',
            'GET',
            'HEAD',
            'OPTIONS',
            'PATCH',
            'POST',
            'PUT',
          ],
          cachedMethods: ['GET', 'HEAD'],
          targetOriginId: frontendBucket.bucketDomainName,
          viewerProtocolPolicy: 'redirect-to-https',
          compress: true,
          forwardedValues: {
            queryString: false,
            cookies: {
              forward: 'none',
            },
          },
        },

        origin: [
          {
            originId: frontendBucket.bucketDomainName,
            domainName: frontendBucket.bucketRegionalDomainName,
            originAccessControlId: cloudfrontOAC.id,
          },
        ],

        aliases: [domainName],

        viewerCertificate: {
          acmCertificateArn: zone.defaultCertificate.arn,
          sslSupportMethod: 'sni-only',
          minimumProtocolVersion: 'TLSv1.2_2019',
        },

        restrictions: {
          geoRestriction: {
            restrictionType: 'none',
          },
        },
      },
    );

    new S3BucketPolicy(this, 'FrontendBucketPolicy', {
      bucket: frontendBucket.bucket,
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: {
              Service: 'cloudfront.amazonaws.com',
            },
            Action: 's3:GetObject',
            Resource: `${frontendBucket.arn}/*`,
            Condition: {
              StringEquals: {
                'AWS:SourceArn': cloudfrontDistribution.arn,
              },
            },
          },
        ],
      }),
    });

    new Route53Record(this, 'FrontendRecord', {
      name: domainName,
      zoneId: zone.zone.zoneId,
      type: 'A',
      alias: {
        name: cloudfrontDistribution.domainName,
        zoneId: cloudfrontDistribution.hostedZoneId,
        evaluateTargetHealth: true,
      },
    });
  }
}
