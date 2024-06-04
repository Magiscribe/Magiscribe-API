import { Construct } from 'constructs';
import AppStack from 'stacks/app';
import FrontendStack from 'stacks/client';
import DataStack from 'stacks/data';
import NetworkStack from 'stacks/network';
import config from '../bin/config';

export default class Stage {
  constructor(scope: Construct) {
    const network = new NetworkStack(scope, 'network', {
      apexDomainName: config.dns.apexDomainName,
      records: config.dns.records,
    });

    const data = new DataStack(scope, 'data', {
      vpc: network.vpc,
    });

    new AppStack(scope, 'app', {
      vpc: network.vpc,
      domainName: `api.${config.dns.apexDomainName}`,
      zone: network.dnsZone,
      repositoryPythonExecutor: data.repositoryPythonExecutor,
      repositoryApp: data.repositoryApp,
      redis: data.redis,
    });

    new FrontendStack(scope, 'client-app', {
      domainName: `*.${config.dns.apexDomainName}`,
      zone: network.dnsZone,
    });

    new FrontendStack(scope, 'client-landing', {
      domainName: `${config.dns.apexDomainName}`,
      zone: network.dnsZone,
    });
  }
}
