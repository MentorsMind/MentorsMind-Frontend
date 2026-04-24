
export type StellarAssetCode = 'XLM' | 'USDC' | 'PYUSD';

export interface StellarAsset {
  code: StellarAssetCode;
  name: string;
  icon: string;
  balance: number;
  priceInUSD: number;
}

export interface PaymentBreakdown {
  baseAmount: number;
  platformFee: number;
  totalAmount: number;
  assetCode: StellarAssetCode;
}

export interface PaymentQuote {
  quoteId: string;
  receiveAmount: number;
  expiresAt: string; // ISO timestamp
  maxSlippagePct: number;
}

export type PaymentStep = 'method' | 'review' | 'processing' | 'success' | 'error';

export interface PaymentState {
  step: PaymentStep;
  selectedAsset: StellarAssetCode;
  transactionHash?: string;
  error?: string;
  idempotencyKey?: string;
  quote?: PaymentQuote;
  quoteSecondsLeft?: number;
  quoteRefreshing?: boolean;
  rateUpdated?: boolean;
  previousReceiveAmount?: number;
}

export interface PaymentDetails {
  mentorId: string;
  mentorName: string;
  sessionId: string;
  sessionTopic: string;
  amount: number; // Base amount in USD or equivalent
}
