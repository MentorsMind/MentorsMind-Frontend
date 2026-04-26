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

const TYPE_CONFIG: Record<PaymentTransaction['type'], { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  deposit: {
    label: 'Deposit',
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  payment: {
    label: 'Payment',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
  },
  refund: {
    label: 'Refund',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
      </svg>
    ),
  },
};

const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({ transaction: tx, onClick }) => {
  const statusCfg = STATUS_CONFIG[tx.status];
  const typeCfg = TYPE_CONFIG[tx.type];

  // Format description based on transaction type
  const getFormattedDescription = () => {
    if (tx.type === 'refund' && tx.originalPaymentId) {
      return `Refund for: ${tx.description}`;
    }
    if (tx.type === 'payment') {
      return `Payment to: ${tx.mentorName}`;
    }
    return tx.description;
  };

  return (
    <button
      id={`tx-item-${tx.id}`}
      onClick={() => onClick(tx)}
      className="w-full text-left group flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50/80 border border-transparent hover:border-gray-100 transition-all duration-200 cursor-pointer"
    >
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-200 ${typeCfg.bg}`}
      >
        {typeCfg.icon}
      </div>

      {/* Middle info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-gray-900 truncate">{tx.mentorName}</p>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${typeCfg.bg} ${typeCfg.text}`}>
            {typeCfg.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">{getFormattedDescription()}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">
          {tx.stellarTxHash.slice(0, 8)}…{tx.stellarTxHash.slice(-8)}
        </p>
      </div>

      {/* Right side */}
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        <span className={`text-base font-black ${tx.type === 'refund' ? 'text-sky-600' : 'text-gray-900'}`}>
          {tx.type === 'refund' ? '−' : '+'}{tx.amount} <span className="text-xs font-bold text-gray-400">{tx.currency}</span>
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
        className="w-4 h-4 text-gray-300 group-hover:text-stellar transition-colors flex-shrink-0"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
};

export default PaymentHistoryItem;
