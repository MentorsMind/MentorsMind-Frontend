import api from './api.client';

export interface WalletBalance {
  assetCode: 'XLM' | 'USDC' | 'PYUSD';
  balance: string;
  usdValue: number;
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
 * Get wallet balances for all supported assets
 */
export async function getWalletBalances(): Promise<WalletBalance[]> {
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
 * Get transaction history with pagination
 */
export async function getTransactionHistory(
  cursor?: string,
  limit: number = 20
): Promise<{
  transactions: WalletTransaction[];
  nextCursor?: string;
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
