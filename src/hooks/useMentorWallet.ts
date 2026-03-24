import { useState, useCallback } from 'react';
import type { WalletState, AssetCode, TxType, TxStatus } from '../types';

const MOCK_STATE: WalletState = {
  address: 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZWM9CQJKR3BSQNEWVZOR',
  assets: [
    { code: 'XLM', balance: 4_820.5, usdValue: 0.112 },
    { code: 'USDC', balance: 1_240.0, usdValue: 1.0 },
    { code: 'yXLM', balance: 320.0, usdValue: 0.115 },
  ],
  pendingEarnings: 320.0,
  availableEarnings: 1_560.0,
  totalEarned: 12_400.0,
  platformFeeRate: 0.05,
  forecastNextMonth: 1_850.0,
  transactions: [
    { id: 't1', type: 'earning', status: 'completed', amount: 120, asset: 'USDC', usdAmount: 120, description: 'Session: React Hooks Deep Dive', sessionId: 's1', date: '2026-03-20', fee: 6 },
    { id: 't2', type: 'earning', status: 'completed', amount: 80, asset: 'USDC', usdAmount: 80, description: 'Session: Solidity Basics', sessionId: 's2', date: '2026-03-18', fee: 4 },
    { id: 't3', type: 'payout', status: 'completed', amount: 500, asset: 'USDC', usdAmount: 500, description: 'Payout to wallet', date: '2026-03-15' },
    { id: 't4', type: 'earning', status: 'completed', amount: 200, asset: 'XLM', usdAmount: 22.4, description: 'Session: DeFi Architecture', sessionId: 's3', date: '2026-03-12', fee: 10 },
    { id: 't5', type: 'earning', status: 'pending', amount: 160, asset: 'USDC', usdAmount: 160, description: 'Session: Smart Contract Audit', sessionId: 's4', date: '2026-03-22', fee: 8 },
    { id: 't6', type: 'fee', status: 'completed', amount: 28, asset: 'USDC', usdAmount: 28, description: 'Platform fee (5%)', date: '2026-03-20' },
    { id: 't7', type: 'earning', status: 'completed', amount: 90, asset: 'USDC', usdAmount: 90, description: 'Session: TypeScript Patterns', sessionId: 's5', date: '2026-03-10', fee: 4.5 },
    { id: 't8', type: 'payout', status: 'pending', amount: 320, asset: 'USDC', usdAmount: 320, description: 'Payout requested', date: '2026-03-23' },
  ],
  payoutHistory: [
    { id: 'p1', amount: 500, asset: 'USDC', status: 'completed', requestedAt: '2026-03-15', completedAt: '2026-03-16', txHash: 'abc123...def' },
    { id: 'p2', amount: 320, asset: 'USDC', status: 'pending', requestedAt: '2026-03-23' },
    { id: 'p3', amount: 750, asset: 'USDC', status: 'completed', requestedAt: '2026-02-28', completedAt: '2026-03-01', txHash: 'xyz789...uvw' },
  ],
  sessionEarnings: [
    { sessionId: 's1', studentName: 'Alex M.', topic: 'React Hooks Deep Dive', date: '2026-03-20', duration: 60, grossAmount: 120, platformFee: 6, netAmount: 114, asset: 'USDC' },
    { sessionId: 's2', studentName: 'Priya K.', topic: 'Solidity Basics', date: '2026-03-18', duration: 45, grossAmount: 80, platformFee: 4, netAmount: 76, asset: 'USDC' },
    { sessionId: 's3', studentName: 'Jordan L.', topic: 'DeFi Architecture', date: '2026-03-12', duration: 90, grossAmount: 200, platformFee: 10, netAmount: 190, asset: 'XLM' },
    { sessionId: 's4', studentName: 'Sam C.', topic: 'Smart Contract Audit', date: '2026-03-22', duration: 60, grossAmount: 160, platformFee: 8, netAmount: 152, asset: 'USDC' },
    { sessionId: 's5', studentName: 'Riley T.', topic: 'TypeScript Patterns', date: '2026-03-10', duration: 45, grossAmount: 90, platformFee: 4.5, netAmount: 85.5, asset: 'USDC' },
  ],
};

export type TxFilter = 'all' | TxType | TxStatus;

export function useMentorWallet() {
  const [wallet] = useState<WalletState>(MOCK_STATE);
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutAsset, setPayoutAsset] = useState<AssetCode>('USDC');
  const [payoutStatus, setPayoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  const filteredTx = wallet.transactions.filter((tx: WalletState['transactions'][number]) => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter || tx.status === txFilter;
  });

  const copyAddress = useCallback(() => {
    navigator.clipboard.writeText(wallet.address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [wallet.address]);

  const requestPayout = useCallback(async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0 || amount > wallet.availableEarnings) return;
    setPayoutStatus('loading');
    await new Promise(r => setTimeout(r, 1500));
    setPayoutStatus('success');
    setTimeout(() => { setPayoutStatus('idle'); setPayoutAmount(''); }, 3000);
  }, [payoutAmount, wallet.availableEarnings]);

  const exportEarnings = useCallback(() => {
    const rows = [
      ['Date', 'Student', 'Topic', 'Duration (min)', 'Gross', 'Fee', 'Net', 'Asset'],
      ...wallet.sessionEarnings.map((s: WalletState['sessionEarnings'][number]) => [
        s.date, s.studentName, s.topic, s.duration,
        s.grossAmount, s.platformFee, s.netAmount, s.asset,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'earnings.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [wallet.sessionEarnings]);

  return {
    wallet,
    txFilter, setTxFilter,
    filteredTx,
    payoutAmount, setPayoutAmount,
    payoutAsset, setPayoutAsset,
    payoutStatus,
    requestPayout,
    copied, copyAddress,
    exportEarnings,
  };
}
