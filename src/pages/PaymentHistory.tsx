import React, { useState } from 'react';
import { usePaymentHistory } from '../hooks/usePaymentHistory';
import PaymentHistoryList from '../components/payment/PaymentHistoryList';
import PaymentFilters from '../components/payment/PaymentFilters';
import TransactionDetail from '../components/payment/TransactionDetail';
import { generatePaymentReceipt } from '../utils/pdf-receipt';
import { retryPayment } from '../services/payment.service';
import type { PaymentTransaction } from '../types';

const PaymentHistory: React.FC = () => {
  const {
    transactions,
    analytics,
    filters,
    sortField,
    sortDirection,
    currentPage,
    totalPages,
    totalResults,
    updateFilters,
    toggleStatusFilter,
    clearFilters,
    handleSort,
    setCurrentPage,
  } = usePaymentHistory();

  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);

  const handleTransactionClick = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseDetail = () => {
    setSelectedTransaction(null);
  };

  const handleDownloadReceipt = (transactionId: string) => {
    // In a real app, you'd fetch the full transaction details from the API
    // For now, we'll use the transaction from the list
    const transaction = transactions.find(tx => tx.id === transactionId);
    if (transaction) {
      // Mock full breakdown data - in real app this would come from API
      const receiptData = {
        ...transaction,
        fullBreakdown: {
          baseAmount: transaction.amount,
          platformFeePercentage: 5,
          platformFeeAmount: transaction.amount * 0.05,
          networkFeeAmount: 0.00001,
          totalDeductions: transaction.amount * 0.05 + 0.00001,
          netAmount: transaction.amount - (transaction.amount * 0.05 + 0.00001),
        },
        stellarDetails: {
          transactionHash: transaction.stellarTxHash,
          ledgerSequence: Math.floor(Math.random() * 1000000),
          timestamp: transaction.date,
          horizonUrl: `https://horizon-testnet.stellar.org/transactions/${transaction.stellarTxHash}`,
        },
      };

      generatePaymentReceipt(receiptData);
    }
  };

  const handleRetryPayment = async (transactionId: string) => {
    try {
      await retryPayment(transactionId);
      // In a real app, you'd refresh the data or show a success message
      alert('Payment retry initiated successfully');
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Failed to retry payment:', error);
      alert('Failed to retry payment. Please try again.');
    }
  };

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
          <PaymentFilters
            filters={filters}
            onUpdateFilters={updateFilters}
            onToggleStatus={toggleStatusFilter}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Payment History List */}
        <PaymentHistoryList
          transactions={transactions}
          analytics={analytics}
          sortField={sortField}
          sortDirection={sortDirection}
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          onSort={handleSort}
          onPageChange={setCurrentPage}
          onSelectTransaction={handleTransactionClick}
        />

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
