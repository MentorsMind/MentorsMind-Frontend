import { useState, useEffect } from 'react';
import {
  getTransactionHistory,
  getStellarExplorerUrl,
  type WalletTransaction,
} from '../../services/wallet.service';

const TYPE_BADGES: Record<
  WalletTransaction['type'],
  { label: string; color: string }
> = {
  deposit: { label: 'Deposit', color: 'bg-green-100 text-green-700' },
  withdrawal: { label: 'Withdrawal', color: 'bg-orange-100 text-orange-700' },
  payment: { label: 'Payment', color: 'bg-blue-100 text-blue-700' },
  refund: { label: 'Refund', color: 'bg-purple-100 text-purple-700' },
};

const STATUS_CHIPS: Record<
  WalletTransaction['status'],
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

export default function TransactionHistoryList() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (cursor?: string) => {
    const isLoadingMore = !!cursor;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const result = await getTransactionHistory(cursor);
      if (isLoadingMore) {
        setTransactions((prev) => [...prev, ...result.transactions]);
      } else {
        setTransactions(result.transactions);
      }
      setNextCursor(result.nextCursor);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📭</p>
        <p className="text-lg font-medium">No transactions yet</p>
        <p className="text-sm mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const typeBadge = TYPE_BADGES[tx.type];
        const statusChip = STATUS_CHIPS[tx.status];

        return (
          <div
            key={tx.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${typeBadge.color}`}
                  >
                    {typeBadge.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusChip.color}`}
                  >
                    {statusChip.label}
                  </span>
                </div>

                {tx.description && (
                  <p className="text-sm text-gray-700 mb-1">{tx.description}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>
                    {new Date(tx.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  {tx.stellar_tx_hash && (
                    <>
                      <span>•</span>
                      <a
                        href={getStellarExplorerUrl(tx.stellar_tx_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        View on Explorer
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <p
                  className={`text-lg font-bold ${
                    tx.type === 'deposit' || tx.type === 'refund'
                      ? 'text-green-600'
                      : 'text-gray-900'
                  }`}
                >
                  {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                  {parseFloat(tx.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7,
                  })}{' '}
                  {tx.assetCode}
                </p>
                <p className="text-xs text-gray-500">
                  ${tx.usdValue.toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {nextCursor && (
        <button
          onClick={() => fetchTransactions(nextCursor)}
          disabled={loadingMore}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
