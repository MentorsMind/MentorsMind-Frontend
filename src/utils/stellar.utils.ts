/**
 * Stellar Utility Functions
 */

export const STELLAR_EXPERT_URL = 'https://stellar.expert/explorer/public';

/**
 * Formats a crypto amount to a readable string with fixed decimals
 */
export function formatCryptoAmount(amount: number | string, decimals = 4): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Gets the current USD price for a Stellar asset
 * In a real app, this would fetch from an API like CoinGecko or Horizon
 */
export async function getCryptoPrice(assetCode: string): Promise<number> {
  const prices: Record<string, number> = {
    XLM: 0.12,
    USDC: 1.00,
    PYUSD: 1.00,
  };
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return prices[assetCode] || 0;
}

/**
 * Calculates the USD equivalent of a crypto amount
 */
export function convertToUSD(amount: number, price: number): string {
  return (amount * price).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

/**
 * Returns a link to Stellar Expert for a given transaction hash
 */
export function getStellarExpertLink(hash: string): string {
  return `${STELLAR_EXPERT_URL}/tx/${hash}`;
}

/**
 * Returns a link to Stellar Expert for a given account/escrow address
 */
export function getAccountLink(address: string): string {
  return `${STELLAR_EXPERT_URL}/account/${address}`;
}

/**
 * Maps common Stellar error codes to human-readable messages
 */
export function getStellarErrorMessage(errorCode: string): string {
  const errorMap: Record<string, string> = {
    'op_underfunded': 'Insufficient funds for this transaction.',
    'op_low_reserve': 'Account does not have enough XLM for the minimum reserve.',
    'tx_bad_seq': 'Transaction sequence number is incorrect.',
    'tx_too_late': 'Transaction has expired.',
    'op_no_trust': 'You don\'t have a trustline for this asset.',
    'op_not_authorized': 'You are not authorized to hold this asset.',
  };
  
  return errorMap[errorCode] || 'An unexpected error occurred on the Stellar network.';
}
