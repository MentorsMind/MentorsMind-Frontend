import React from 'react';
import HealthFactor from './HealthFactor';

interface LoanFormProps {
  mode: 'open' | 'add-collateral' | 'repay';
  // open loan
  collateralInput?: string;
  onCollateralChange?: (v: string) => void;
  borrowInput?: string;
  onBorrowChange?: (v: string) => void;
  previewHealthFactor?: number | null;
  mntBalance?: number;
  usdcBalance?: number;
  // add collateral
  addCollateralInput?: string;
  onAddCollateralChange?: (v: string) => void;
  // repay
  repayInput?: string;
  onRepayChange?: (v: string) => void;
  outstanding?: number;
  // shared
  onSubmit: () => void;
  txStatus: 'idle' | 'loading' | 'success' | 'error';
  mntUsdcRate: number;
}

const LoanForm: React.FC<LoanFormProps> = ({
  mode,
  collateralInput = '', onCollateralChange,
  borrowInput = '', onBorrowChange,
  previewHealthFactor,
  mntBalance = 0,
  usdcBalance = 0,
  addCollateralInput = '', onAddCollateralChange,
  repayInput = '', onRepayChange,
  outstanding = 0,
  onSubmit,
  txStatus,
  mntUsdcRate,
}) => {
  const loading = txStatus === 'loading';

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
      {mode === 'open' && (
        <>
          <h3 className="font-semibold text-gray-800">Open New Loan</h3>
          <div className="space-y-3">
            <label className="block text-sm text-gray-600">
              Collateral (MNT)
              <span className="float-right text-gray-400">Balance: {mntBalance.toLocaleString()} MNT</span>
            </label>
            <input
              type="number"
              min="0"
              value={collateralInput}
              onChange={e => onCollateralChange?.(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="block text-sm text-gray-600">Borrow (USDC)</label>
            <input
              type="number"
              min="0"
              value={borrowInput}
              onChange={e => onBorrowChange?.(e.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400">Oracle rate: 1 MNT = {mntUsdcRate} USDC</p>
            <HealthFactor value={previewHealthFactor ?? null} label="Preview Health Factor" />
          </div>
          <button
            onClick={onSubmit}
            disabled={loading || !collateralInput || !borrowInput}
            className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing…' : 'Open Loan'}
          </button>
        </>
      )}

      {mode === 'add-collateral' && (
        <>
          <h3 className="font-semibold text-gray-800">Add Collateral</h3>
          <label className="block text-sm text-gray-600">
            Amount (MNT)
            <span className="float-right text-gray-400">Balance: {mntBalance.toLocaleString()} MNT</span>
          </label>
          <input
            type="number"
            min="0"
            value={addCollateralInput}
            onChange={e => onAddCollateralChange?.(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={onSubmit}
            disabled={loading || !addCollateralInput}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing…' : 'Add Collateral'}
          </button>
        </>
      )}

      {mode === 'repay' && (
        <>
          <h3 className="font-semibold text-gray-800">Repay Loan</h3>
          <label className="block text-sm text-gray-600">
            Amount (USDC)
            <span className="float-right text-gray-400">Outstanding: {outstanding.toFixed(2)} USDC</span>
          </label>
          <input
            type="number"
            min="0"
            max={outstanding}
            value={repayInput}
            onChange={e => onRepayChange?.(e.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onRepayChange?.((outstanding / 2).toFixed(2))}
              className="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              50%
            </button>
            <button
              onClick={() => onRepayChange?.(outstanding.toFixed(2))}
              className="flex-1 rounded-lg border border-gray-300 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
            >
              Full
            </button>
          </div>
          <p className="text-xs text-gray-400">Wallet USDC: {usdcBalance.toFixed(2)}</p>
          <button
            onClick={onSubmit}
            disabled={loading || !repayInput}
            className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing…' : 'Repay'}
          </button>
        </>
      )}

      {txStatus === 'success' && (
        <p className="text-center text-sm font-medium text-green-600">✓ Transaction successful</p>
      )}
    </div>
  );
};

export default LoanForm;
