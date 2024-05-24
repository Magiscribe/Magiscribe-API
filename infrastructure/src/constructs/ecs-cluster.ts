import { CloudwatchLogGroup } from '@cdktf/provider-aws/lib/cloudwatch-log-group';
import { EcsCluster } from '@cdktf/provider-aws/lib/ecs-cluster';
import { EcsClusterCapacityProviders } from '@cdktf/provider-aws/lib/ecs-cluster-capacity-providers';
import { EcsTaskDefinition } from '@cdktf/provider-aws/lib/ecs-task-definition';
import { IamRole } from '@cdktf/provider-aws/lib/iam-role';
import { Construct } from 'constructs';

export class Cluster extends Construct {
  readonly cluster: EcsCluster;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.cluster = new EcsCluster(this, 'Cluster', {
      name: 'whiteboard-cluster',
    });

    new EcsClusterCapacityProviders(this, `ClusterCapacityProviders`, {
      clusterName: this.cluster.name,
      capacityProviders: ['FARGATE'],
    });
  }

  public runDockerImage({
    name,
    image,
    env,
  }: {
    name: string;
    image: string;
    env: Record<string, string | undefined>;
  }) {
    // Role that allows us to get the Docker image
    const executionRole = new IamRole(this, `execution-role`, {
      name: `${name}-execution-role`,
      inlinePolicy: [
        {
          name: 'allow-ecr-pull',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'ecr:GetAuthorizationToken',
                  'ecr:BatchCheckLayerAvailability',
                  'ecr:GetDownloadUrlForLayer',
                  'ecr:BatchGetImage',
                  'logs:CreateLogStream',
                  'logs:PutLogEvents',
                ],
                Resource: '*',
              },
            ],
          }),
        },
      ],
      // this role shall only be used by an ECS task
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Sid: '',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
    });

    // Role that allows us to push logs
    const taskRole = new IamRole(this, `task-role`, {
      name: `${name}-task-role`,
      inlinePolicy: [
        {
          name: 'allow-logs',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['logs:CreateLogStream', 'logs:PutLogEvents'],
                Resource: '*',
              },
            ],
          }),
        },
        {
          name: 'bedrock-policy',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: ['bedrock:*'],
                Resource: '*',
              },
            ],
          }),
        },
        {
          name: 'invoke-policy',
          policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  'lambda:InvokeFunction',
                  'lambda:GetFunction',
                  'lambda:DescribeFunction',
                ],
                Resource: '*',
              },
            ],
          }),
        },
      ],
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'sts:AssumeRole',
            Effect: 'Allow',
            Sid: '',
            Principal: {
              Service: 'ecs-tasks.amazonaws.com',
            },
          },
        ],
      }),
    });

    // Creates a log group for the task
    const logGroup = new CloudwatchLogGroup(this, `loggroup`, {
      name: `${this.cluster.name}/${name}`,
      retentionInDays: 30,
    });

    // Creates a task that runs the docker container
    const task = new EcsTaskDefinition(this, `task`, {
      cpu: '256',
      memory: '512',
      requiresCompatibilities: ['FARGATE'],
      networkMode: 'awsvpc',
      executionRoleArn: executionRole.arn,
      taskRoleArn: taskRole.arn,
      containerDefinitions: JSON.stringify([
        {
          name,
          image,
          cpu: 256,
          memory: 512,
          environment: Object.entries(env).map(([name, value]) => ({
            name,
            value,
          })),
          portMappings: [
            {
              containerPort: 80,
            },
          ],
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              // Defines the log
              'awslogs-group': logGroup.name,
              'awslogs-region': process.env.CDKTF_REGION,
              'awslogs-stream-prefix': name,
            },
          },
        },
      ]),
      family: 'service',
    });

    return task;
  }
}
