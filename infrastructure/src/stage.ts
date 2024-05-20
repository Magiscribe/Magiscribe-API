import { Construct } from 'constructs';
import AppStack from 'stacks/app';
import FrontendStack from 'stacks/client';
import DataStack from 'stacks/data';
import NetworkStack from 'stacks/network';

interface StageProps {
  apexDomainName: string;
}

export default class Stage {
  constructor(scope: Construct, props: StageProps) {
    const network = new NetworkStack(scope, 'network', {
      apexDomainName: props.apexDomainName,
    });

    const data = new DataStack(scope, 'data');

    new AppStack(scope, 'app', {
      vpc: network.vpc,
      domainName: `api.${props.apexDomainName}`,
      zone: network.hostedZone,
      repositoryPythonExecutor: data.repositoryPythonExecutor,
      repositoryApp: data.repositoryApp,
    });

    new FrontendStack(scope, 'client-app', {
      domainName: `*.${props.apexDomainName}`,
      zone: network.hostedZone,
    });

    new FrontendStack(scope, 'client-landing', {
      domainName: `${props.apexDomainName}`,
      zone: network.hostedZone,
    });
  }
}
