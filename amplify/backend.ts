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

// Enable advanced security features for email OTP
cfnUserPool.userPoolAddOns = {
  advancedSecurityMode: 'ENFORCED',
};

// Configure passwordless authentication methods
cfnUserPool.addPropertyOverride(
  'Policies.SignInPolicy.AllowedFirstAuthFactors',
  ['EMAIL_OTP', 'PASSWORD']
);

// Enable EMAIL_OTP in MFA options
cfnUserPool.enabledMfas = [...(cfnUserPool.enabledMfas || []), 'EMAIL_OTP'];

// Configure auth flows for passwordless
cfnUserPoolClient.explicitAuthFlows = [
  'ALLOW_REFRESH_TOKEN_AUTH',
  'ALLOW_USER_AUTH',
  'ALLOW_USER_PASSWORD_AUTH',
  'ALLOW_USER_SRP_AUTH',
];

// Set auth flow configuration
cfnUserPoolClient.authFlows = {
  userAuth: true,
  userSrp: true,
};

// Configure email verification
cfnUserPool.autoVerifiedAttributes = ['email'];
cfnUserPool.aliasAttributes = ['email', 'preferred_username'];

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

// Configure account recovery
cfnUserPool.accountRecoverySetting = {
  recoveryMechanisms: [
    {
      name: 'verified_email',
      priority: 1,
    },
  ],
};
