import React from 'react';

interface Transaction {
  id: string;
  hash: string;
  type: 'payment' | 'create_account' | 'path_payment' | 'escrow' | 'fee' | 'other';
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  from: string;
  to: string;
  timestamp: Date;
  successful: boolean;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  walletAddress: string;
  loading?: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ 
  transactions, 
  walletAddress, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-900">Transaction History</h3>
        <button className="text-sm font-bold text-stellar hover:underline">View Horizon</button>
      </div>
      
      <div className="p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No transactions found for this account.
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 hover:border-stellar/20 hover:bg-stellar/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'payment' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tx.type === 'payment' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</div>
                    <div className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-black ${tx.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>
                    {tx.amount} {tx.assetCode}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest ${tx.successful ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.successful ? 'Successful' : 'Failed'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
