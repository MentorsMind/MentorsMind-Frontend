import React, { useState } from 'react';
import { useRevenueTransactions } from '../hooks/useRevenueTransactions';
import { RevenuePaymentFilters } from '../components/payment/PaymentFilters';
import PaymentHistoryList from '../components/payment/PaymentHistoryList';
import { TransactionDetail } from '../components/payment/TransactionDetail';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { generatePaymentReceipt } from '../utils/pdf-receipt';
import { retryPayment } from '../services/payment.service';
import type { PaymentTransaction } from '../types';

// ── Loading skeleton ──────────────────────────────────────────────────────────

const TransactionSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
    <div className="h-5 w-40 bg-gray-100 rounded animate-pulse mb-6" />
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} variant="history" />
      ))}
    </div>
  </div>
);

// ── Error state ───────────────────────────────────────────────────────────────

const TransactionError: React.FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
      <svg
        className="w-7 h-7 text-red-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    </div>
    <h3 className="text-sm font-bold text-gray-700 mb-1">Unable to load transaction data</h3>
    <p className="text-xs text-gray-400 mb-5 max-w-xs">{message}</p>
    <button
      onClick={onRetry}
      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-stellar text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark transition-all"
    >
      Retry
    </button>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const PaymentHistory: React.FC = () => {
  const {
    transactions,
    loading,
    error,
    hasFetched,
    filters,
    updateFilters,
    fetchTransactions,
    retry,
    canFetch,
  } = useRevenueTransactions();

  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);

  const handleTransactionClick = (tx: PaymentTransaction) => setSelectedTransaction(tx);
  const handleCloseDetail = () => setSelectedTransaction(null);

  const handleDownloadReceipt = (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    const receiptData = {
      ...tx,
      fullBreakdown: {
        baseAmount: tx.amount,
        platformFeePercentage: 5,
        platformFeeAmount: tx.amount * 0.05,
        networkFeeAmount: 0.00001,
        totalDeductions: tx.amount * 0.05 + 0.00001,
        netAmount: tx.amount - (tx.amount * 0.05 + 0.00001),
      },
      stellarDetails: {
        transactionHash: tx.stellarTxHash,
        ledgerSequence: 0,
        timestamp: tx.date,
        horizonUrl: `https://horizon-testnet.stellar.org/transactions/${tx.stellarTxHash}`,
      },
    };
    generatePaymentReceipt(receiptData);
  };

  const handleRetryPayment = async (transactionId: string) => {
    try {
      await retryPayment(transactionId);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Failed to retry payment:', err);
    }
  };

  // Derive analytics from the loaded transactions
  const analytics = transactions.reduce(
    (acc, tx) => {
      acc.transactionCount += 1;
      if (tx.status === 'completed') {
        acc.totalCompleted += tx.amount;
        acc.totalSpent += tx.amount;
      } else if (tx.status === 'pending') {
        acc.totalPending += tx.amount;
        acc.totalSpent += tx.amount;
      } else if (tx.status === 'failed') {
        acc.totalFailed += tx.amount;
      }
      return acc;
    },
    {
      totalSpent: 0,
      totalCompleted: 0,
      totalPending: 0,
      totalRefunded: 0,
      totalFailed: 0,
      transactionCount: 0,
    },
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Payment History</h1>
          <p className="text-gray-600">View and manage all your payment transactions</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <RevenuePaymentFilters
            filters={filters}
            onUpdateFilters={updateFilters}
            onLoad={fetchTransactions}
            loading={loading}
            canLoad={canFetch}
          />
        </div>

        {/* Content area */}
        {loading ? (
          <TransactionSkeleton />
        ) : error ? (
          <TransactionError message={error} onRetry={retry} />
        ) : hasFetched ? (
          <PaymentHistoryList
            transactions={transactions}
            analytics={analytics}
            sortField="date"
            sortDirection="desc"
            currentPage={1}
            totalPages={1}
            totalResults={transactions.length}
            onSort={() => {}}
            onPageChange={() => {}}
            onSelectTransaction={handleTransactionClick}
          />
        ) : (
          /* Initial state — user hasn't loaded yet */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Select a date range and click "Load Transactions"
            </p>
          </div>
        )}

        {/* Transaction Detail Modal */}
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={handleCloseDetail}
          onDownloadReceipt={handleDownloadReceipt}
          onRetryPayment={handleRetryPayment}
        />
      </div>
    </div>
  );
};

export default PaymentHistory;
