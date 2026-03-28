import { useState } from 'react';
import type { TreasuryDashboardData } from '../types';

const MOCK_TREASURY_DATA: TreasuryDashboardData = {
  totalValueUsd: 125430.25,
  assets: [
    { code: 'XLM', balance: 500000, usdValue: 65000, change24h: 2.5 },
    { code: 'USDC', balance: 45000, usdValue: 45000, change24h: 0 },
    { code: 'yXLM', balance: 120000, usdValue: 15430.25, change24h: 3.2 },
  ],
  recentTransactions: [
    {
      id: 'tx1',
      type: 'inbound',
      amount: 5000,
      asset: 'XLM',
      from: 'GD7P...4RT2',
      to: 'Treasury',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
      memo: 'Revenue Share'
    },
    {
      id: 'tx2',
      type: 'outbound',
      amount: 1200,
      asset: 'USDC',
      from: 'Treasury',
      to: 'GA...1234',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed',
      memo: 'Proposal #12 Funding'
    },
    {
      id: 'tx3',
      type: 'inbound',
      amount: 150,
      asset: 'yXLM',
      from: 'YieldPool',
      to: 'Treasury',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
      memo: 'Staking Rewards'
    }
  ],
  revenueData: [
    { date: '2026-03-21', amount: 450 },
    { date: '2026-03-22', amount: 520 },
    { date: '2026-03-23', amount: 480 },
    { date: '2026-03-24', amount: 610 },
    { date: '2026-03-25', amount: 590 },
    { date: '2026-03-26', amount: 720 },
    { date: '2026-03-27', amount: 680 },
  ],
  expenseData: [
    { date: '2026-03-21', amount: 120 },
    { date: '2026-03-22', amount: 150 },
    { date: '2026-03-23', amount: 200 },
    { date: '2026-03-24', amount: 0 },
    { date: '2026-03-25', amount: 350 },
    { date: '2026-03-26', amount: 100 },
    { date: '2026-03-27', amount: 420 },
  ],
  allocation: [
    { name: 'XLM (Native)', value: 52, color: '#3b82f6' },
    { name: 'USDC (Fiat)', value: 36, color: '#22c55e' },
    { name: 'Yield Assets', value: 12, color: '#a855f7' },
  ]
};

export const useTreasuryDashboard = () => {
  const [data] = useState<TreasuryDashboardData>(MOCK_TREASURY_DATA);
  const [isLoading] = useState(false);

  return {
    data,
    isLoading
  };
};
