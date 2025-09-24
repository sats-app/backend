import { defineAuth, secret } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource for Sats App
 * Passwordless authentication with email OTP
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: 'CODE',
      verificationEmailSubject: 'Your Sats App verification code',
      verificationEmailBody: (createCode) => `Your Sats App verification code is: ${createCode()}. This code expires in 10 minutes.`,
    },
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
    preferredUsername: {
      required: false,
      mutable: true,
    },
  },
  multifactor: {
    mode: 'OFF',
  },
});
