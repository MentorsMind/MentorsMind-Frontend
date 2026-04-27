import api from './api.client';

/**
 * Raw balance from the API — uses assetType for native XLM, assetCode for tokens
 */
export interface RawWalletBalance {
  /** "native" for XLM, undefined for tokens */
  assetType?: 'native';
  /** e.g. "USDC", "PYUSD" — present only for non-native assets */
  assetCode?: string;
  balance: string;
  assetIssuer?: string;
}

/**
 * Normalised balance used by UI components — always has assetCode
 */
export interface WalletBalance {
  assetCode: string;
  balance: string;
  usdValue: number;
  assetIssuer?: string;
  isNative: boolean;
}

/**
 * Response from GET /wallet_balances — two distinct shapes depending on account state
 */
export interface WalletBalanceResponse {
  balances: RawWalletBalance[];
  accountExists: boolean;
  message?: string;
  lastUpdated?: string; // ISO 8601
}

export interface WalletActivationResponse {
  publicKey: string;
  activated: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  assetCode: 'XLM' | 'USDC' | 'PYUSD';
  amount: string;
  usdValue: number;
  status: 'pending' | 'completed' | 'failed';
  stellar_tx_hash?: string;
  createdAt: string;
  description?: string;
}

export interface FeeEstimate {
  baseFee: string;
  platformFee: string;
  totalFee: string;
  assetCode: string;
}

/**
 * Normalise a raw balance from the API into a UI-friendly shape.
 * - assetType === "native"  → assetCode = "XLM", isNative = true
 * - assetCode present       → assetCode as-is, isNative = false
 */
export function normaliseBalance(raw: RawWalletBalance): WalletBalance {
  const isNative = raw.assetType === 'native';
  const assetCode = isNative ? 'XLM' : (raw.assetCode ?? 'UNKNOWN');
  return {
    assetCode,
    balance: raw.balance,
    usdValue: 0, // populated separately by price feed
    assetIssuer: raw.assetIssuer,
    isNative,
  };
}

/**
 * Get wallet balances for all supported assets.
 * Returns the raw API response so callers can check accountExists before rendering.
 */
export async function getWalletBalances(): Promise<WalletBalanceResponse> {
  const { data } = await api.get('/wallet_balances');
  return data.data;
}

/**
 * Get wallet information
 */
export async function getWallet(): Promise<{ publicKey: string; activated: boolean }> {
  const { data } = await api.get('/wallets');
  return data.data;
}

/**
 * Activate a new Stellar wallet
 */
export async function activateWallet(): Promise<WalletActivationResponse> {
  const { data } = await api.post('/wallets/activate');
  return data.data;
}

/**
 * Get transaction history with pagination.
 * NOTE: uses pagination.cursor and pagination.hasMore — different from
 * bookings/payments which use next_cursor / has_more.
 */
export async function getTransactionHistory(
  cursor?: string,
  limit: number = 20
): Promise<{
  transactions: WalletTransaction[];
  pagination: {
    cursor: string | null;
    hasMore: boolean;
  };
}> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);
  params.set('limit', limit.toString());

  const { data } = await api.get(`/wallet/transactions?${params.toString()}`);
  return data.data;
}

/**
 * Get fee estimate for a payment
 */
export async function getFeeEstimate(
  amount: number,
  assetCode: 'XLM' | 'USDC' | 'PYUSD'
): Promise<FeeEstimate> {
  const { data } = await api.get('/payments/fee-estimate', {
    params: { amount, asset: assetCode },
  });
  return data.data;
}

/**
 * Get Stellar explorer URL for a transaction
 */
export function getStellarExplorerUrl(txHash: string, network: 'testnet' | 'mainnet' = 'testnet'): string {
  const baseUrl =
    network === 'mainnet'
      ? 'https://stellar.expert/explorer/public'
      : 'https://stellar.expert/explorer/testnet';
  return `${baseUrl}/tx/${txHash}`;
}

