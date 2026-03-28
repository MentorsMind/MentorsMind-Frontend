import React from 'react';

export default function TransactionHistory({ 
  transactions, 
  walletAddress, 
  loading 
}: { 
  transactions: any[], 
  walletAddress: string, 
  loading: boolean 
}) {
  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-3xl"></div>;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h3>
      {transactions?.length === 0 ? (
        <p className="text-gray-500 text-sm">No transactions found.</p>
      ) : (
        <div className="space-y-3">
          {transactions?.slice(0, 5).map((tx, i) => (
             <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
               <div>
                  <p className="font-semibold text-sm text-gray-900">{tx.type || 'Transaction'}</p>
                  <p className="text-xs text-gray-400">{tx.date || 'Recent'}</p>
               </div>
               <div className="text-sm font-bold text-stellar">
                 {tx.amount} {tx.asset}
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
