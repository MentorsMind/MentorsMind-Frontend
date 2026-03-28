import React, { useState } from 'react';

interface Transaction {
  id: string;
  hash: string;
  type: string;
  amount: string;
  assetCode: string;
  from: string;
  to: string;
  timestamp: Date;
  status: string;
  fee?: string;
  memo?: string;
  hash?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  walletAddress: string;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  walletAddress, 
  loading,
  hasMore,
  onLoadMore
}) => {
  const [filter, setFilter] = useState<'All' | 'Sent' | 'Received'>('All');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading transactions...</div>;
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'All') return true;
    if (filter === 'Sent') return tx.from === walletAddress;
    if (filter === 'Received') return tx.to === walletAddress;
    return true;
  });

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 15) return addr;
    return `${addr.slice(0, 9)}...${addr.slice(-6)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="font-bold text-gray-900">Transaction History</h3>
        
        <div className="flex gap-2">
          {['All', 'Sent', 'Received'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-sm rounded-lg ${
                filter === f ? 'bg-stellar text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <h4 className="font-bold text-gray-900 mb-1">No transactions yet</h4>
            <p className="text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const isSent = tx.from === walletAddress;
              const sign = isSent ? '-' : '+';
              const displayType = isSent ? 'Sent' : 'Received';

              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)}
                  className="cursor-pointer flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-stellar/20 hover:bg-stellar/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{displayType} {tx.assetCode}</div>
                      <div className="text-xs text-gray-500">
                        From: {formatAddress(tx.from)}
                      </div>
                      {tx.memo && <div className="text-xs italic text-gray-400 mt-1">Memo: {tx.memo}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black ${isSent ? 'text-red-500' : 'text-green-500'}`}>
                      {sign}{parseFloat(tx.amount).toFixed(7)} {tx.assetCode}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </div>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <button 
                onClick={onLoadMore}
                className="w-full py-3 mt-4 text-sm font-bold text-stellar bg-stellar/5 hover:bg-stellar/10 rounded-xl transition-colors"
              >
                Load More
              </button>
            )}
          </div>
        )}
      </div>

      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg">Transaction Details</h3>
              <button onClick={() => setSelectedTx(null)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-100 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction Hash</div>
                <div className="text-sm font-mono bg-gray-50 p-3 rounded-lg break-all">
                  {selectedTx.hash}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                <div className="font-bold">{selectedTx.status}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
