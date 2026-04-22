import React from 'react';
import type { Transaction } from '../../types';

interface Props {
  transactions?: Transaction[];
  walletAddress?: string;
  loading?: boolean;
}

export const TransactionHistory: React.FC<Props> = ({ 
  transactions = [], 
  walletAddress,
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-center animate-pulse">
        <p className="text-sm text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Transaction History</h3>
          {walletAddress && <p className="text-[10px] text-gray-400 truncate max-w-[150px]">{walletAddress}</p>}
        </div>
        <button className="text-sm font-bold text-stellar hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">No transactions yet</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900 capitalize">{tx.type}</span>
                    <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{tx.description}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.asset}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tx.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
