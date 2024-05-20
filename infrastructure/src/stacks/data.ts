import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { Repository } from '@constructs/ecs-repository';
import { TagsAddingAspect } from 'aspects/tag-aspect';
import { Aspects, S3Backend, TerraformStack } from 'cdktf';
import config from '../../bin/config';
import { Construct } from 'constructs';

export default class DataStack extends TerraformStack {
  readonly repositoryPythonExecutor: Repository;
  readonly repositoryApp: Repository;

  constructor(scope: Construct, id: string) {
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

    /*================= ECR =================*/

    this.repositoryPythonExecutor = new Repository(this, 'PythonExecutor', {
      name: 'python-executor',
    });

    this.repositoryApp = new Repository(this, 'App', {
      name: 'graphql-api',
    });
  }
}
