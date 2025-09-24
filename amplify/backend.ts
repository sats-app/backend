import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Sats App Backend Configuration
 * Implements passwordless authentication with email OTP
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

// Override Cognito UserPool for passwordless authentication
const { cfnUserPool, cfnUserPoolClient } = backend.auth.resources.cfnResources;

// Enable advanced security features
cfnUserPool.userPoolAddOns = {
  advancedSecurityMode: 'AUDIT',
};

// Configure auth flows for passwordless
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_REFRESH_TOKEN_AUTH',
  'ALLOW_USER_AUTH',
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_USER_SRP_AUTH',
];

// Configure email verification
cfnUserPool.autoVerifiedAttributes = ['email'];

// Configure password policy for backup auth method
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
    temporaryPasswordValidityDays: 7,
  },
};
