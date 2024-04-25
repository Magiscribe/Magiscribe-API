import { CognitoUserPool } from '@cdktf/provider-aws/lib/cognito-user-pool';
import { CognitoUserPoolClient } from '@cdktf/provider-aws/lib/cognito-user-pool-client';
import { CognitoUserPoolDomain } from '@cdktf/provider-aws/lib/cognito-user-pool-domain';
import { Construct } from 'constructs';

export class Authentication extends Construct {
  readonly cognito: CognitoUserPool;
  readonly cognitoClient: CognitoUserPoolClient;
  readonly cognitoDomain: CognitoUserPoolDomain;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.cognito = new CognitoUserPool(this, 'Cognito', {
      name: 'Cognito',

      emailVerificationSubject: 'Your Verification Code',
      emailVerificationMessage: 'Please use the following code: {####}',
      aliasAttributes: ['email'],
      autoVerifiedAttributes: ['email'],

      schema: [
        {
          name: 'email',
          required: true,
          mutable: false,
          attributeDataType: 'String',
        },
        {
          name: 'given_name',
          required: true,
          mutable: true,
          attributeDataType: 'String',
        },
        {
          name: 'family_name',
          required: true,
          mutable: true,
          attributeDataType: 'String',
        },
      ],

      passwordPolicy: {
        minimumLength: 12,
        requireLowercase: false,
        requireNumbers: true,
        requireSymbols: false,
        requireUppercase: true,
        temporaryPasswordValidityDays: 7,
      },
    });

    this.cognitoClient = new CognitoUserPoolClient(this, 'CognitoClient', {
      userPoolId: this.cognito.id,
      name: 'CognitoClient',
      generateSecret: false,
      explicitAuthFlows: ['USER_PASSWORD_AUTH'],
    });

    this.cognitoDomain = new CognitoUserPoolDomain(this, 'CognitoDomain', {
      domain: 'whiteboard',
      userPoolId: this.cognito.id,
    });
  }
}
