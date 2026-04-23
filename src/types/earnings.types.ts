export type PayoutStatus = 'pending' | 'completed' | 'failed';

export type SortKey = 'sessionDate' | 'grossAmount' | 'netPayout';

export type ChartRange = 'weekly' | 'monthly';

export interface EarningsSummaryData {
  totalAllTimeNet: number;
  pendingEscrow: number;
  thisMonthNet: number;
  currency: string;
}

export interface MentorPayoutSession {
  sessionId: string;
  sessionDate: string;
  menteeName: string;
  durationMinutes: number;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  asset: string;
  payoutStatus: PayoutStatus;
  txHash?: string;
  estimatedReleaseDate?: string;
}

export interface ChartSeries {
  label: string;
  netPayout: number;
}

export interface RawPayoutSession {
  sessionId: string;
  sessionDate: string;
  menteeName: string;
  durationMinutes: number;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  asset: string;
  payoutStatus: PayoutStatus;
  txHash?: string;
  estimatedReleaseDate?: string;
}

export interface EarningsApiResponse {
  summary: {
    totalAllTimeNet: number;
    pendingEscrow: number;
    thisMonthNet: number;
    currency: string;
  };
  sessions: RawPayoutSession[];
}
