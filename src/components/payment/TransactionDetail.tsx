import React from 'react';
import type { PaymentTransaction, PaymentStatus } from '../../types';

interface TransactionDetailProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
  onDownloadReceipt: (txId: string) => void;
  onRetryPayment?: (txId: string) => void;
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
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex-shrink-0 pt-0.5">
      {label}
    </span>
    <div className="text-sm font-semibold text-gray-800 text-right">{children}</div>
  </div>
);

export const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  onClose,
  onDownloadReceipt,
  onRetryPayment,
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
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white overflow-hidden">
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
              className="flex-shrink-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
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

        {/* Amount Breakdown Section */}
        {(transaction.grossAmount || transaction.netAmount) && (
          <div className="mx-6 my-2 rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-stellar/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-stellar" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Amount Breakdown
              </span>
            </div>
            <div className="space-y-2">
              {transaction.grossAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Gross Amount:</span>
                  <span className="font-semibold">{transaction.grossAmount} {transaction.currency}</span>
                </div>
              )}
              {transaction.platformFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee:</span>
                  <span className="font-semibold text-red-600">-{transaction.platformFee} {transaction.currency}</span>
                </div>
              )}
              {transaction.networkFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network Fee:</span>
                  <span className="font-semibold text-red-600">-{transaction.networkFee} {transaction.currency}</span>
                </div>
              )}
              {transaction.netAmount && (
                <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                  <span className="text-gray-900 font-semibold">Net Amount:</span>
                  <span className="font-bold text-stellar">{transaction.netAmount} {transaction.currency}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Failure Reason Section */}
        {transaction.status === 'failed' && transaction.failureReason && (
          <div className="mx-6 my-2 rounded-2xl bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">
                  Transaction Failed
                </div>
                <p className="text-sm text-red-700">{transaction.failureReason}</p>
                {transaction.failedAt && (
                  <p className="text-xs text-red-600 mt-1">
                    Failed on {new Date(transaction.failedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Refund Information */}
        {transaction.isRefund && transaction.originalPaymentId && (
          <div className="mx-6 my-2 rounded-2xl bg-sky-50 border border-sky-200 p-4">
            <div className="flex items-start gap-2 mb-2">
              <svg className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-sky-700 mb-1">
                  Refund Information
                </div>
                <p className="text-sm text-sky-700">
                  This is a refund for transaction {transaction.originalPaymentId}
                </p>
                {transaction.refundReason && (
                  <p className="text-xs text-sky-600 mt-1">Reason: {transaction.refundReason}</p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="p-6 pt-4 space-y-3">
          <button
            id="download-receipt-btn"
            onClick={() => onDownloadReceipt(transaction.id)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Receipt
          </button>

          {transaction.status === 'failed' && onRetryPayment && (
            <button
              id="retry-payment-btn"
              onClick={() => onRetryPayment(transaction.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stellar text-white rounded-2xl text-sm font-bold hover:bg-stellar/90 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retry Payment
            </button>
          )}

          <button
            id="close-detail-btn"
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;
