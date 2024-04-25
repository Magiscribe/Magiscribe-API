import { AcmCertificate } from '@cdktf/provider-aws/lib/acm-certificate';
import { AcmCertificateValidation } from '@cdktf/provider-aws/lib/acm-certificate-validation';
import { Route53Record } from '@cdktf/provider-aws/lib/route53-record';
import { Route53Zone } from '@cdktf/provider-aws/lib/route53-zone';
import { Construct } from 'constructs';

export interface HostedZoneProps {
  domainName: string;
  subjectAlternativeNames?: string[];
}

export class HostedZone extends Construct {
  readonly zone: Route53Zone;
  readonly defaultCertificate: AcmCertificate;

  constructor(scope: Construct, id: string, props: HostedZoneProps) {
    super(scope, id);

    const { domainName, subjectAlternativeNames } = props;

    // Certificate
    this.defaultCertificate = new AcmCertificate(this, 'certificate', {
      domainName,
      subjectAlternativeNames: [
        `*.${domainName}`,
        ...(subjectAlternativeNames ?? []),
      ],
      validationMethod: 'DNS',
    });

    // Route53 Zone
    this.zone = new Route53Zone(this, 'zone', {
      name: domainName,
    });

    const record = new Route53Record(this, 'validation-record', {
      name: '${each.value.name}',
      type: '${each.value.type}',
      records: ['${each.value.record}'],
      zoneId: this.zone.zoneId,
      ttl: 60,
      allowOverwrite: true,
    });

    record.addOverride(
      'for_each',
      `\${{
              for dvo in aws_acm_certificate.${this.defaultCertificate.friendlyUniqueId}.domain_validation_options : dvo.domain_name => {
                name   = dvo.resource_record_name
                record = dvo.resource_record_value
                type   = dvo.resource_record_type
              }
            }
          }`,
    );

    const certValidation = new AcmCertificateValidation(
      this,
      'certvalidation',
      {
        certificateArn: this.defaultCertificate.arn,
      },
    );
    certValidation.addOverride(
      'validation_record_fqdns',
      `\${[for record in aws_route53_record.${record.friendlyUniqueId} : record.fqdn]}`,
    );
  }
}
