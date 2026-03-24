
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

export type PaymentStep = 'method' | 'review' | 'processing' | 'success' | 'error';

export interface PaymentState {
  step: PaymentStep;
  selectedAsset: StellarAssetCode;
  transactionHash?: string;
  error?: string;
}

export interface PaymentDetails {
  mentorId: string;
  mentorName: string;
  sessionId: string;
  sessionTopic: string;
  amount: number; // Base amount in USD or equivalent
}
