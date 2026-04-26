export type PayoutStatus = 'pending' | 'completed' | 'failed';

export type SortKey = 'sessionDate' | 'grossAmount' | 'netPayout';

export type ChartRange = 'weekly' | 'monthly';

export type GroupBy = 'day' | 'week' | 'month';

export interface DateRangeFilter {
  from: string;
  to: string;
}

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

// ---------------------------------------------------------------------------
// Mentor Earnings Endpoint — GET /mentors/:id/earnings
// ---------------------------------------------------------------------------

export interface MentorEarningsBreakdownItem {
  period: string; // ISO date string
  earnings: number;
  sessions: number;
}

export interface MentorEarningsResponse {
  totalEarnings: number;
  totalSessions: number;
  averagePerSession: number;
  breakdown: MentorEarningsBreakdownItem[];
}

// ---------------------------------------------------------------------------
// Wallet Earnings Endpoint — GET /wallets/me/earnings
// ---------------------------------------------------------------------------

export interface WalletEarningsTransaction {
  id: string;
  type: string;
  amount: string;
  asset: string;
  date: string;
  description?: string;
}

export interface WalletPeriodSummary {
  startDate: string;
  endDate: string;
  sessionCount: number;
  averageEarning: string;
}

export interface WalletEarningsResponse {
  totalEarnings: string;
  currentPeriodEarnings: string;
  recentTransactions: WalletEarningsTransaction[];
  periodSummary: WalletPeriodSummary;
}

