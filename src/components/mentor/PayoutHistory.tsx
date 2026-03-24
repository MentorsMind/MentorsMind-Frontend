import React from 'react';
import type { PayoutRequest, Transaction } from '../../types';
import type { TxFilter } from '../../hooks/useMentorWallet';

const TX_TYPE_LABELS: Record<string, string> = {
  earning: 'Earning',
  payout: 'Payout',
  fee: 'Fee',
  refund: 'Refund',
};

const TX_TYPE_STYLES: Record<string, string> = {
  earning: 'bg-emerald-50 text-emerald-600',
  payout: 'bg-blue-50 text-blue-600',
  fee: 'bg-red-50 text-red-500',
  refund: 'bg-violet-50 text-violet-600',
};

const STATUS_STYLES: Record<string, string> = {
  completed: 'text-emerald-500',
  pending: 'text-amber-500',
  failed: 'text-red-500',
};

const FILTERS: { label: string; value: TxFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Earnings', value: 'earning' },
  { label: 'Payouts', value: 'payout' },
  { label: 'Fees', value: 'fee' },
  { label: 'Pending', value: 'pending' },
];

interface PayoutHistoryProps {
  transactions: Transaction[];
  payoutHistory: PayoutRequest[];
  filter: TxFilter;
  onFilterChange: (f: TxFilter) => void;
}

const PayoutHistory: React.FC<PayoutHistoryProps> = ({ transactions, payoutHistory, filter, onFilterChange }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900">Transaction History</h3>
        <span className="text-xs text-gray-400">{transactions.length} transactions</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => onFilterChange(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === f.value ? 'bg-stellar text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-2 mb-8" role="list" aria-label="Transactions">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No transactions found</p>
        ) : (
          transactions.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors" role="listitem">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${TX_TYPE_STYLES[tx.type]}`}>
                {TX_TYPE_LABELS[tx.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold tabular-nums ${tx.type === 'fee' ? 'text-red-500' : 'text-gray-900'}`}>
                  {tx.type === 'fee' ? '-' : tx.type === 'payout' ? '-' : '+'}{tx.amount} {tx.asset}
                </p>
                <p className={`text-xs font-semibold ${STATUS_STYLES[tx.status]}`}>{tx.status}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payout history */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Payout History</h4>
        <div className="space-y-2" role="list" aria-label="Payout history">
          {payoutHistory.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100" role="listitem">
              <div>
                <p className="text-sm font-bold text-gray-900 tabular-nums">${p.amount} {p.asset}</p>
                <p className="text-xs text-gray-400">Requested {p.requestedAt}</p>
                {p.txHash && <p className="text-[10px] font-mono text-gray-300 mt-0.5">{p.txHash}</p>}
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                p.status === 'completed' ? 'bg-emerald-50 text-emerald-600'
                : p.status === 'pending' ? 'bg-amber-50 text-amber-600'
                : 'bg-red-50 text-red-500'
              }`}>
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PayoutHistory;
