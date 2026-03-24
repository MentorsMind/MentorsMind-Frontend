import { useState } from 'react';
import type { Transaction } from '../../types/wallet.types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  walletAddress: string;
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const TransactionHistory = ({ 
  transactions, 
  walletAddress,
  loading,
  onLoadMore,
  hasMore = false
}: TransactionHistoryProps) => {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'sent') return tx.from === walletAddress;
    if (filter === 'received') return tx.to === walletAddress;
    return true;
  });

  const getTransactionIcon = (tx: Transaction) => {
    const isSent = tx.from === walletAddress;
    
    if (isSent) {
      return (
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      </div>
    );
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('sent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'sent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sent
          </button>
          <button
            onClick={() => setFilter('received')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'received'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Received
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {loading && transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading transactions...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isSent = tx.from === walletAddress;
            
            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(tx)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900">
                        {isSent ? 'Sent' : 'Received'} {tx.assetCode}
                      </p>
                      <p className={`font-semibold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                        {isSent ? '-' : '+'}{parseFloat(tx.amount).toFixed(7)} {tx.assetCode}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <p className="truncate">
                        {isSent ? 'To: ' : 'From: '}
                        {(isSent ? tx.to : tx.from).substring(0, 8)}...
                        {(isSent ? tx.to : tx.from).substring((isSent ? tx.to : tx.from).length - 8)}
                      </p>
                      <p>{formatDate(tx.timestamp)}</p>
                    </div>
                    
                    {tx.memo && (
                      <p className="text-sm text-gray-600 mt-1">Memo: {tx.memo}</p>
                    )}
                  </div>
                  
                  <div>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {hasMore && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {selectedTx && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTx(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Transaction Details</h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Amount</p>
                <p className="font-semibold">{selectedTx.amount} {selectedTx.assetCode}</p>
              </div>
              <div>
                <p className="text-gray-600">From</p>
                <p className="font-mono text-xs break-all">{selectedTx.from}</p>
              </div>
              <div>
                <p className="text-gray-600">To</p>
                <p className="font-mono text-xs break-all">{selectedTx.to}</p>
              </div>
              <div>
                <p className="text-gray-600">Transaction Hash</p>
                <p className="font-mono text-xs break-all">{selectedTx.hash}</p>
              </div>
              <div>
                <p className="text-gray-600">Fee</p>
                <p className="font-semibold">{selectedTx.fee} XLM</p>
              </div>
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-semibold">{selectedTx.timestamp.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
            </div>

            <button
              onClick={() => window.open(`https://stellar.expert/explorer/public/tx/${selectedTx.hash}`, '_blank')}
              className="w-full mt-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View on Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
