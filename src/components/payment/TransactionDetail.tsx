import React from 'react';
import type { PaymentTransaction, PaymentStatus } from '../../types';

interface TransactionDetailProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
  onDownloadReceipt: (txId: string) => void;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; border: string }> = {
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
  },
};

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0 pt-0.5">
      {label}
    </span>
    <div className="text-sm font-semibold text-gray-800 text-right">{children}</div>
  </div>
);

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
  onDownloadReceipt,
}) => {
  if (!transaction) return null;

  const statusCfg = STATUS_CONFIG[transaction.status];
  const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${transaction.stellarTxHash}`;

  return (
    /* Backdrop */
    <div
      id="transaction-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if ((e.target as HTMLElement).id === 'transaction-detail-backdrop') onClose(); }}
    >
      <div
        id="transaction-detail-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="relative bg-linear-to-br from-gray-900 to-gray-800 p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-stellar/20 rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                Transaction Detail
              </div>
              <h2 className="text-xl font-black mb-1">{transaction.mentorName}</h2>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{transaction.description}</p>
            </div>
            <button
              id="close-modal-btn"
              onClick={onClose}
              className="shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Amount Hero */}
          <div className="mt-5 pt-5 border-t border-white/10 flex items-end justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Amount</div>
              <div className="text-3xl font-black">
                {transaction.type === 'refund' ? '−' : '+'}{transaction.amount}{' '}
                <span className="text-base text-gray-400">{transaction.currency}</span>
              </div>
            </div>
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* Details Body */}
        <div className="px-6 py-2">
          <DetailRow label="Date">
            {new Date(transaction.date).toLocaleString('en-GB', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </DetailRow>
          <DetailRow label="Transaction ID">
            <span className="font-mono text-xs">{transaction.id.toUpperCase()}</span>
          </DetailRow>
          {transaction.sessionTopic && (
            <DetailRow label="Session Topic">{transaction.sessionTopic}</DetailRow>
          )}
          <DetailRow label="Type">
            <span className="capitalize">{transaction.type}</span>
          </DetailRow>
        </div>

        {/* Stellar Section */}
        <div className="mx-6 my-2 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-stellar/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-stellar" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Stellar Network
            </span>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TX Hash</div>
            <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">
              {transaction.stellarTxHash}
            </p>
          </div>
          <a
            id="stellar-explorer-link"
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-stellar hover:underline underline-offset-4 transition-all group"
          >
            View on Stellar Expert Explorer
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4 grid grid-cols-2 gap-3">
          <button
            id="download-receipt-btn"
            onClick={() => onDownloadReceipt(transaction.id)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Receipt
          </button>
          <button
            id="close-detail-btn"
            onClick={onClose}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
