import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Sats App Data Schema
 * Implements models compatible with CDK's WalletDatabase trait
 * All sensitive data (proofs, quotes, transactions) are stored encrypted
 */
const schema = a.schema({

  // Mint quotes for token creation
  MintQuote: a
    .model({
      quoteId: a.string().required(),
      encryptedQuote: a.string().required(), // Encrypted quote data including all sensitive fields
      state: a.enum(['UNPAID', 'PAID', 'ISSUED']),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('state').sortKeys(['createdAt']),
    ]),

  // Melt quotes for token redemption
  MeltQuote: a
    .model({
      quoteId: a.string().required(),
      encryptedQuote: a.string().required(), // Encrypted quote data including all sensitive fields
      state: a.enum(['UNPAID', 'PAID', 'PENDING', 'UNKNOWN', 'FAILED']),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('state').sortKeys(['createdAt']),
    ]),

  // Token proofs
  Proof: a
    .model({
      proofId: a.string().required(), // Unique identifier for the proof
      encryptedProof: a.string().required(), // Encrypted proof data including all sensitive fields
      state: a.enum(['SPENT', 'UNSPENT', 'PENDING', 'RESERVED', 'PENDING_SPENT']),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()])
    .secondaryIndexes((index) => [
      index('state').sortKeys(['createdAt']),
    ]),

  // Transaction records
  Transaction: a
    .model({
      transactionId: a.string().required(),
      encryptedTransaction: a.string().required(), // Encrypted transaction data including all details
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  // Wallet metadata
  WalletMetadata: a
    .model({
      mintUrls: a.string().array(), // Array of mint URLs
      defaultMintUrl: a.string(),
      createdAt: a.datetime().default(new Date().toISOString()),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
