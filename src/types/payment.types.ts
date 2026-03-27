
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

// ── Escrow Types ─────────────────────────────────────────────────────────────

export type EscrowStatus = 'active' | 'released' | 'disputed' | 'refunded';

export type EscrowTimelineStage = 'created' | 'session' | 'release' | 'disputed' | 'refunded';

export interface EscrowTimelineEvent {
  stage: EscrowTimelineStage;
  timestamp: string;
  description: string;
  transactionHash?: string;
}

export interface EscrowDispute {
  id: string;
  reason: string;
  description: string;
  filedBy: 'learner' | 'mentor';
  filedAt: string;
  status: 'pending' | 'resolved' | 'rejected';
  resolution?: {
    outcome: 'refunded' | 'released' | 'split';
    resolvedAt: string;
    resolverId: string;
    notes: string;
  };
}

export interface EscrowContract {
  id: string;
  sessionId: string;
  contractAddress: string;
  status: EscrowStatus;
  amount: number;
  asset: StellarAssetCode;
  learnerId: string;
  mentorId: string;
  createdAt: string;
  sessionDate: string;
  autoReleaseAt: string;
  disputeWindowEndsAt: string;
  releasedAt?: string;
  timeline: EscrowTimelineEvent[];
  dispute?: EscrowDispute;
  stellarExpertUrl: string;
}

export interface EscrowReleaseRequest {
  escrowId: string;
  sessionId: string;
  requestedBy: 'mentor' | 'system';
  requestedAt: string;
}

export interface EscrowDisputeRequest {
  escrowId: string;
  sessionId: string;
  reason: string;
  description: string;
  filedBy: 'learner';
  filedAt: string;
}
