import React from 'react';
import type { PaymentTransaction, PaymentStatus } from '../../types';

interface PaymentHistoryItemProps {
  transaction: PaymentTransaction;
  onClick: (tx: PaymentTransaction) => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
  },
};

const TYPE_ICONS: Record<PaymentTransaction['type'], React.ReactNode> = {
  session: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  subscription: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  refund: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
  ),
};

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({ transaction: tx, onClick }) => {
  const statusCfg = STATUS_CONFIG[tx.status];
  const isRefund = tx.type === 'refund';

  return (
    <button
      id={`tx-item-${tx.id}`}
      onClick={() => onClick(tx)}
      className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all duration-200 cursor-pointer"
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 ${
          isRefund ? 'bg-sky-50 text-sky-500' : 'bg-stellar/10 text-stellar'
        }`}
      >
        {TYPE_ICONS[tx.type]}
      </div>

      {/* Middle info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-gray-900 truncate">{tx.mentorName}</p>
        </div>
        <p className="text-xs text-gray-500 truncate">{tx.description}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
          {tx.stellarTxHash.slice(0, 8)}…{tx.stellarTxHash.slice(-8)}
        </p>
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className={`text-base font-black ${isRefund ? 'text-sky-600' : 'text-gray-900'}`}>
          {isRefund ? '−' : '+'}{tx.amount} <span className="text-xs font-bold text-gray-400">{tx.currency}</span>
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${statusCfg.bg} ${statusCfg.text}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
        <span className="text-[10px] text-gray-400">
          {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-stellar transition-colors shrink-0"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default PaymentHistoryItem;
