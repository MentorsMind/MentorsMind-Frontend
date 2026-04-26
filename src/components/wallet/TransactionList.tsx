import React from 'react';
import { ArrowUpRight, Banknote, Repeat, ShieldCheck, Sparkles } from 'lucide-react';
import type { PaymentTransaction } from '../../types';
import type { TransactionType } from '../../hooks/useTransactionHistory';

const ICONS: Record<TransactionType, React.ComponentType<{ className?: string }>> = {
  payment: Banknote,
  escrow: ShieldCheck,
  swap: Repeat,
  fee: ArrowUpRight,
  staking: Sparkles,
};

const STATUS_CLASSES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-violet-100 text-violet-700',
};

interface TransactionListProps {
  pendingTransactions: PaymentTransaction[];
  monthlyGroups: { month: string; total: number; transactions: PaymentTransaction[] }[];
  hasMore: boolean;
  onLoadMore: () => void;
  onSelectTransaction: (transaction: PaymentTransaction) => void;
  onSort: (field: 'date' | 'amount' | 'status') => void;
  sortField: 'date' | 'amount' | 'status';
  sortDirection: 'asc' | 'desc';
  transactions: PaymentTransaction[];
}

export function TransactionList({
  pendingTransactions,
  monthlyGroups,
  hasMore,
  onLoadMore,
  onSelectTransaction,
  onSort,
  sortField,
  sortDirection,
  transactions,
}: TransactionListProps) {
  return (
    <div className="space-y-6">
      {pendingTransactions.length > 0 && (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">Pending transactions</p>
              <h2 className="mt-1 text-xl font-bold text-gray-900">Live status updates</h2>
            </div>
            <div className="text-sm text-gray-500">Auto-refreshing every 5 seconds</div>
          </div>
          <div className="space-y-3">
            {pendingTransactions.map((tx) => {
              const Icon = ICONS[(tx.transactionType ?? 'payment') as TransactionType];
              return (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => onSelectTransaction(tx)}
                  className="w-full rounded-3xl border border-gray-200 bg-slate-50 p-4 text-left transition hover:border-stellar/60"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stellar/10 text-stellar">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASSES[tx.status]}`}>
                      {tx.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Transactions</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">All records</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <button
              type="button"
              onClick={() => onSort('date')}
              className={`rounded-full px-4 py-2 transition ${sortField === 'date' ? 'bg-stellar text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Date {sortField === 'date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              onClick={() => onSort('amount')}
              className={`rounded-full px-4 py-2 transition ${sortField === 'amount' ? 'bg-stellar text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Amount {sortField === 'amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
            <button
              type="button"
              onClick={() => onSort('status')}
              className={`rounded-full px-4 py-2 transition ${sortField === 'status' ? 'bg-stellar text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              Status {sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </button>
          </div>
        </div>

        {monthlyGroups.map((group) => (
          <div key={group.month} className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{group.month}</p>
                  <p className="text-sm text-gray-500">Monthly total: {group.transactions.length} transactions</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">{group.total.toFixed(2)} total</div>
              </div>
            </div>

            <div className="space-y-3">
              {group.transactions.map((tx) => {
                const Icon = ICONS[(tx.transactionType ?? 'payment') as TransactionType];
                return (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTransaction(tx)}
                    className="w-full rounded-3xl border border-gray-200 p-4 text-left transition hover:border-stellar/60"
                  >
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] items-center">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-stellar/10 text-stellar">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{tx.description}</p>
                          <p className="text-sm text-gray-500">{tx.stellarTxHash.slice(0, 8)}…{tx.stellarTxHash.slice(-8)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{tx.amount.toFixed(2)} {tx.currency}</p>
                        <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onLoadMore}
              className="rounded-3xl bg-stellar px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
            >
              Load more transactions
            </button>
          </div>
        )}

        {transactions.length === 0 && (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            No matching transactions found for the current filters.
          </div>
        )}
      </div>
    </div>
  );
}
