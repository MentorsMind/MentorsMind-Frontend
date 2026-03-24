export interface StellarWallet {
  publicKey: string;
  secretKey?: string;
  balance: WalletBalance[];
  createdAt: Date;
  lastSynced: Date;
  isBackedUp: boolean;
  nickname?: string;
}

export interface WalletBalance {
  assetCode: string;
  assetIssuer?: string;
  balance: string;
  limit?: string;
  isNative: boolean;
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'payment' | 'create_account' | 'path_payment' | 'manage_offer' | 'account_merge';
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  from: string;
  to: string;
  memo?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  fee: string;
}

export interface WalletCreationStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface WalletBackup {
  mnemonic?: string;
  secretKey: string;
  publicKey: string;
  createdAt: Date;
  verified: boolean;
}

export interface FundingMethod {
  id: string;
  type: 'crypto' | 'fiat' | 'testnet';
  name: string;
  description: string;
  minAmount?: string;
  maxAmount?: string;
  fee?: string;
}

export interface WalletSecuritySettings {
  requirePasswordForTransactions: boolean;
  biometricEnabled: boolean;
  autoLockTimeout: number;
  trustedAddresses: string[];
}

export interface WalletNotification {
  id: string;
  type: 'transaction' | 'security' | 'balance' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}
