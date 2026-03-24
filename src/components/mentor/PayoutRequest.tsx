import React from 'react';
import type { AssetCode } from '../../types';

interface PayoutRequestProps {
  availableEarnings: number;
  pendingEarnings: number;
  amount: string;
  asset: AssetCode;
  status: 'idle' | 'loading' | 'success' | 'error';
  onAmountChange: (v: string) => void;
  onAssetChange: (a: AssetCode) => void;
  onSubmit: () => void;
}

const ASSETS: AssetCode[] = ['USDC', 'XLM', 'yXLM'];

const PayoutRequest: React.FC<PayoutRequestProps> = ({
  availableEarnings,
  pendingEarnings,
  amount,
  asset,
  status,
  onAmountChange,
  onAssetChange,
  onSubmit,
}) => {
  const parsed = parseFloat(amount) || 0;
  const isValid = parsed > 0 && parsed <= availableEarnings;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">Request Payout</h3>

      {/* Earnings summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-emerald-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-emerald-600 mb-1">Available</p>
          <p className="text-2xl font-bold text-emerald-700 tabular-nums">${availableEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-amber-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">${pendingEarnings.toLocaleString()}</p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="flex flex-col items-center py-6 text-center gap-2" role="status">
          <span className="text-4xl">✅</span>
          <p className="font-bold text-gray-900">Payout Requested</p>
          <p className="text-sm text-gray-500">Funds will arrive in your wallet within 1–2 minutes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Asset selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Asset</label>
            <div className="flex gap-2">
              {ASSETS.map(a => (
                <button
                  key={a}
                  onClick={() => onAssetChange(a)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    asset === a ? 'border-stellar bg-stellar/5 text-stellar' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div>
            <label htmlFor="payout-amount" className="block text-xs font-semibold text-gray-500 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                id="payout-amount"
                type="number"
                min="1"
                max={availableEarnings}
                value={amount}
                onChange={e => onAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-20 py-3 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all font-bold text-gray-900 text-lg"
              />
              <button
                onClick={() => onAmountChange(String(availableEarnings))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stellar hover:underline"
              >
                Max
              </button>
            </div>
            {parsed > availableEarnings && (
              <p className="text-xs text-red-500 mt-1" role="alert">Exceeds available balance</p>
            )}
          </div>

          <button
            onClick={onSubmit}
            disabled={!isValid || status === 'loading'}
            className="w-full py-3 bg-stellar text-white font-bold rounded-xl hover:bg-stellar-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-stellar/20 active:scale-95"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              `Withdraw ${amount ? `$${amount}` : ''} ${asset}`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PayoutRequest;
