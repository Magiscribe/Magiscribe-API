import { EcrRepository } from '@cdktf/provider-aws/lib/ecr-repository';
import { Construct } from 'constructs';

export class Repository extends Construct {
  readonly repository: EcrRepository;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.repository = new EcrRepository(this, 'Repository', {
      name: `${id}-repository`,

      // Set to immutable to ensure that the image is not changed after it is pushed.
      // This adheres to best practices for security and ensures that the image is not tampered with.
      imageTagMutability: 'IMMUTABLE',
    });
  }
}
