import { useMemo } from 'react';

// Issue #143: transaction limit display, KYC upgrade CTA, and history tracking.
export type LimitStatus = 'safe' | 'warning' | 'danger';

export interface LimitBucket {
  label: string;
  used: number;
  limit: number;
  remaining: number;
  percent: number;
  status: LimitStatus;
  resetAt: Date;
}

export interface LimitHistoryItem {
  id: string;
  title: string;
  detail: string;
  date: string;
}

const TOOLTIP_TEXT =
  'Completed payouts and pending withdrawals count toward limits. Failed or reversed payouts do not.';

const KYC_URL = '/settings';

const createBucket = (label: string, used: number, limit: number, resetAt: Date): LimitBucket => {
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, Math.round((limit - used) * 100) / 100);
  const status: LimitStatus = percent < 50 ? 'safe' : percent < 80 ? 'warning' : 'danger';

  return {
    label,
    used,
    limit,
    remaining,
    percent,
    status,
    resetAt,
  };
};

export function useTransactionLimits() {
  const limits = useMemo(() => {
    const daily = createBucket('Daily', 450, 1000, new Date('2026-03-30'));
    const monthly = createBucket('Monthly', 6200, 10000, new Date('2026-04-01'));

    const history: LimitHistoryItem[] = [
      {
        id: 'kyc-2',
        title: 'KYC Level 2 approved',
        detail: 'Daily limit raised to $1,000 and monthly limit raised to $10,000.',
        date: '2026-03-12',
      },
      {
        id: 'kyc-1',
        title: 'KYC Level 1 approved',
        detail: 'Daily limit raised to $500 and monthly limit raised to $5,000.',
        date: '2026-02-05',
      },
    ];

    return { daily, monthly, history };
  }, []);

  const wouldExceedDailyLimit = (amount: number) => {
    if (!amount || amount <= 0) return false;
    return amount > limits.daily.remaining;
  };

  return {
    daily: limits.daily,
    monthly: limits.monthly,
    history: limits.history,
    tooltipText: TOOLTIP_TEXT,
    kycUrl: KYC_URL,
    wouldExceedDailyLimit,
  };
}
