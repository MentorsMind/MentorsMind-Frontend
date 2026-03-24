import { useState } from 'react';
import type { WalletBalance as WalletBalanceType } from '../../types/wallet.types';

interface WalletBalanceProps {
  balances: WalletBalanceType[];
  publicKey: string;
  onRefresh: () => void;
  loading?: boolean;
}

export const WalletBalance = ({ balances, publicKey, onRefresh, loading }: WalletBalanceProps) => {
  const [showAllAssets, setShowAllAssets] = useState(false);

  const totalValueUSD = balances.reduce((sum, balance) => {
    // TODO: Fetch real exchange rates
    const rate = balance.assetCode === 'XLM' ? 0.12 : 1.0;
    return sum + parseFloat(balance.balance) * rate;
  }, 0);

  const displayedBalances = showAllAssets ? balances : balances.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-blue-200 text-sm mb-1">Total Balance</p>
          <h2 className="text-4xl font-bold">${totalValueUSD.toFixed(2)}</h2>
          <p className="text-blue-200 text-xs mt-2">
            {publicKey.substring(0, 8)}...{publicKey.substring(publicKey.length - 8)}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Refresh balance"
        >
          <svg
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {displayedBalances.map((balance, index) => (
          <div
            key={`${balance.assetCode}-${balance.assetIssuer || 'native'}`}
            className="bg-white/10 backdrop-blur rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="font-bold text-sm">{balance.assetCode.substring(0, 3)}</span>
                </div>
                <div>
                  <p className="font-semibold">{balance.assetCode}</p>
                  {!balance.isNative && (
                    <p className="text-xs text-blue-200">
                      {balance.assetIssuer?.substring(0, 8)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {parseFloat(balance.balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 7
                  })}
                </p>
                {balance.limit && (
                  <p className="text-xs text-blue-200">
                    Limit: {parseFloat(balance.limit).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {balances.length > 3 && (
        <button
          onClick={() => setShowAllAssets(!showAllAssets)}
          className="w-full mt-4 py-2 text-sm text-blue-200 hover:text-white transition-colors"
        >
          {showAllAssets ? 'Show Less' : `Show ${balances.length - 3} More Assets`}
        </button>
      )}

      <div className="mt-6 pt-6 border-t border-white/20 flex space-x-3">
        <button className="flex-1 bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Send
        </button>
        <button className="flex-1 bg-white/10 backdrop-blur py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors">
          Receive
        </button>
      </div>
    </div>
  );
};
