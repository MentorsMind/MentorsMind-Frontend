import React, { useState } from 'react';
import PoolStats from '../components/lending/PoolStats';
import BorrowPanel from '../components/lending/BorrowPanel';
import LendPanel from '../components/lending/LendPanel';
import { useLendingPool, TransactionRecord } from '../hooks/useLendingPool';

const LendingPool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'borrow' | 'lend'>('borrow');
  
  const {
    creditScore,
    setCreditScore,
    activeLoan,
    poolStats,
    lpBalance,
    availableCredit,
    history,
    isProcessing,
    handleDeposit,
    handleWithdraw,
    handleBorrow,
    handleRepay,
  } = useLendingPool();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h2 className="text-3xl font-bold mb-1">Stellar Lending Pool</h2>
        <p className="text-gray-500">Borrow USDC for sessions or supply liquidity to earn yield.</p>
      </div>

      {/* Risk Disclaimer */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800">
        <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h4 className="font-bold text-sm">Risk Disclaimer</h4>
          <p className="text-xs mt-1">
            DeFi lending protocols carry smart contract and liquidation risks. Never invest or borrow more than you can afford to lose. The platform is not responsible for any lost funds.
          </p>
        </div>
      </div>

      <PoolStats stats={poolStats} />

      {/* Main Tabs Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-4 md:p-8">
        <div className="flex gap-4 mb-8 bg-gray-50 p-1 rounded-2xl md:w-fit">
          <button
            onClick={() => setActiveTab('borrow')}
            className={`flex-1 md:w-32 px-6 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stellar ${
              activeTab === 'borrow'
                ? 'bg-stellar text-white shadow-md shadow-stellar/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Borrow
          </button>
          <button
            onClick={() => setActiveTab('lend')}
            className={`flex-1 md:w-32 px-6 py-3 rounded-xl font-bold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stellar ${
              activeTab === 'lend'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Lend
          </button>
        </div>

        <div className="max-w-2xl">
          {activeTab === 'borrow' ? (
            <BorrowPanel
              creditScore={creditScore}
              availableCredit={availableCredit}
              activeLoan={activeLoan}
              isProcessing={isProcessing}
              onBorrow={handleBorrow}
              onRepay={handleRepay}
            />
          ) : (
            <LendPanel
              lpBalance={lpBalance}
              poolAPY={poolStats.currentAPY}
              isProcessing={isProcessing}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          )}
        </div>
      </div>

      {/* Demo helper to change credit score for testing */}
      <button 
        className="text-xs text-gray-400 underline hover:text-gray-600"
        onClick={() => setCreditScore(prev => prev === 750 ? 550 : 750)}
      >
        Toggle Mock Credit Score (Current: {creditScore})
      </button>

      {/* Transaction History */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 max-w-4xl">
        <h3 className="text-xl font-bold mb-6">Transaction History</h3>
        
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No past transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-4 px-4">Date</th>
                  <th className="pb-4 px-4">Type</th>
                  <th className="pb-4 px-4 font-numeric text-right">Amount (USDC)</th>
                  <th className="pb-4 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((tx: TransactionRecord) => (
                  <tr key={tx.id} className="text-sm">
                    <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                      {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                        tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-700' :
                        tx.type === 'withdraw' ? 'bg-red-50 text-red-700' :
                        tx.type === 'borrow' ? 'bg-amber-50 text-amber-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900 tabular-nums">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LendingPool;
