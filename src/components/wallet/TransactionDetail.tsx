import React from 'react';
import { ExternalLink, FileText, Sparkles } from 'lucide-react';
import type { PaymentTransaction } from '../../types';
import { getStellarExpertLink } from '../../utils/stellar.utils';

interface TransactionDetailProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
  onDownloadReceipt: (transaction: PaymentTransaction) => void;
}

export function TransactionDetail({ transaction, onClose, onDownloadReceipt }: TransactionDetailProps) {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stellar">Transaction detail</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">{transaction.description}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-100 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Transaction info</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-2 font-semibold text-gray-900">{transaction.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="mt-2 font-semibold text-gray-900">{transaction.transactionType ?? 'payment'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="mt-2 font-semibold text-gray-900">{transaction.amount.toFixed(2)} {transaction.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="mt-2 font-semibold text-gray-900">{new Date(transaction.date).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-900">Full on-chain details</p>
              <dl className="mt-4 grid gap-4 text-sm text-gray-600">
                <div>
                  <dt className="font-medium text-gray-700">Transaction hash</dt>
                  <dd className="mt-1 break-all">{transaction.stellarTxHash}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Memo</dt>
                  <dd className="mt-1">{transaction.memo ?? 'None'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Asset</dt>
                  <dd className="mt-1">{transaction.currency}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-700">Description</dt>
                  <dd className="mt-1">{transaction.description}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-100 bg-slate-50 p-5">
              <div className="flex items-center gap-3 text-gray-900">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-sm font-semibold">Quick actions</h3>
              </div>
              <button
                type="button"
                onClick={() => onDownloadReceipt(transaction)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-stellar px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
              >
                <FileText className="h-4 w-4" />
                Download receipt
              </button>
              <a
                href={getStellarExpertLink(transaction.stellarTxHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Open on Stellar Expert
              </a>
            </div>

            <div className="rounded-3xl border border-gray-100 p-5">
              <p className="text-sm font-semibold text-gray-900">Session details</p>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-700">Session topic</p>
                  <p>{transaction.sessionTopic ?? 'N/A'}</p>
                </div>
                {transaction.sessionId && (
                  <div>
                    <p className="font-medium text-gray-700">Session ID</p>
                    <p>{transaction.sessionId}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
