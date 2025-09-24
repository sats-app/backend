# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sats App - A mobile wallet application backend implementing passwordless authentication and CDK WalletDatabase-compatible data models for managing cryptocurrency wallet operations.

## Tech Stack

- AWS Amplify Gen 2 Backend
- TypeScript
- AWS CDK v2
- AWS Cognito (passwordless authentication with email OTP)
- AWS AppSync (GraphQL data layer with encrypted storage)

## Key Commands

### Development

```bash
# Start the Amplify sandbox (local development environment)
npx ampx sandbox

# Start sandbox with function log streaming
npx ampx sandbox --stream-function-logs

# Delete sandbox environment
npx ampx sandbox delete
```

### Code Generation

```bash
# Generate post-deployment artifacts
npx ampx generate
```

### Deployment

```bash
# Deploy in CI/CD pipeline
npx ampx pipeline-deploy
```

## Architecture

### Backend Structure (`amplify/`)

- **backend.ts**: Main backend configuration with CDK overrides for passwordless authentication (EMAIL_OTP, USER_AUTH flow)
- **auth/resource.ts**: Passwordless authentication setup with email/username login, email OTP verification
- **data/resource.ts**: WalletDatabase-compatible models with encrypted storage for sensitive data

### Authentication

- **Passwordless Login**: Email OTP as primary authentication method
- **Optional Username**: Users can set a preferred username but email is the primary identifier
- **Account Recovery**: Email-only recovery mechanism
- **MFA**: Optional multi-factor authentication support
- **Auth Flows**: USER_AUTH flow enabled for choice-based authentication

### Data Schema

The GraphQL schema implements CDK WalletDatabase trait compatibility:

#### Core Models:
- **MintQuote**: Encrypted quotes for minting tokens (states: UNPAID, PAID, ISSUED)
- **MeltQuote**: Encrypted quotes for melting tokens (states: UNPAID, PAID, PENDING, UNKNOWN, FAILED)
- **Proof**: Encrypted token proofs (states: SPENT, UNSPENT, PENDING, RESERVED, PENDING_SPENT)
- **Transaction**: Encrypted transaction records with timestamps
- **WalletMetadata**: Stores mint URLs and default mint selection

#### Key Features:
- All models use owner-based authorization (userPool)
- All sensitive data stored in encrypted fields only
- Mint information fetched online (not stored locally)
- WalletMetadata stores array of mint URLs
- Minimal indexes for state-based querying
- No plaintext sensitive data in models

### TypeScript Configuration

The project uses ES2022 modules with bundler module resolution. The `amplify/tsconfig.json` includes path mapping for generated Amplify resources (`$amplify/*` → `../.amplify/generated/*`).

## Frontend Integration

### Authentication Flow

```typescript
import { signIn, confirmSignIn } from 'aws-amplify/auth';

// Initiate passwordless sign in
const { nextStep } = await signIn({
  username: 'user@example.com',
  options: {
    authFlowType: 'USER_AUTH',
    preferredChallenge: 'EMAIL_OTP'
  }
});

// Confirm with OTP code
await confirmSignIn({
  challengeResponse: '123456'
});
```

### Data Client Usage

```typescript
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

// Example: Update wallet metadata with mints
await client.models.WalletMetadata.create({
  mintUrls: ['https://mint1.example.com', 'https://mint2.example.com'],
  defaultMintUrl: 'https://mint1.example.com'
});

// Example: Query proofs by state
const { data: unspentProofs } = await client.models.Proof.list({
  filter: { state: { eq: 'UNSPENT' } }
});
```

## Notes

- The `.amplify/` directory contains generated resources and should not be edited directly
- The sandbox environment is used for local development and testing
- Passwordless authentication requires configuring SES for email delivery
- All sensitive wallet data (proofs, quotes, transactions) must be encrypted client-side before storage
- The data model supports the CDK WalletDatabase trait for compatibility with Cashu wallet implementations