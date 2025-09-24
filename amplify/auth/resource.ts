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
      verificationEmailBody: (code) =>
        `Your Sats App verification code is: ${code}. This code expires in 10 minutes.`,
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
  accountRecovery: 'EMAIL_ONLY',
  multifactor: {
    mode: 'OPTIONAL',
    totp: false,
    sms: false,
  },
  senders: {
    email: {
      fromEmail: 'noreply@paywithsats.app',
      fromName: 'Sats App',
    },
  },
});
