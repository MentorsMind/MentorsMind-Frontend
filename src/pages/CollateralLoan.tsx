import React, { useState } from 'react';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useCollateralLoan } from '../hooks/useCollateralLoan';
import HealthFactor from '../components/lending/HealthFactor';
import LoanForm from '../components/lending/LoanForm';

type Tab = 'open' | 'add-collateral' | 'repay';

const statusBadge: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  repaid: 'bg-green-100 text-green-700',
  liquidated: 'bg-red-100 text-red-700',
};

const CollateralLoan: React.FC = () => {
  const {
    state,
    collateralInput, setCollateralInput,
    borrowInput, setBorrowInput,
    addCollateralInput, setAddCollateralInput,
    repayInput, setRepayInput,
    previewHealthFactor,
    activeHealthFactor,
    txStatus,
    openLoan,
    addCollateral,
    repayLoan,
  } = useCollateralLoan();

  const [tab, setTab] = useState<Tab>('open');

  const { activeLoan, mntUsdcRate, mntBalance, usdcBalance, history } = state;
  const outstanding = activeLoan ? activeLoan.borrowed - activeLoan.repaid : 0;
  const showWarning = activeHealthFactor !== null && isFinite(activeHealthFactor) && activeHealthFactor < 130;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'open', label: 'Open Loan' },
    { key: 'add-collateral', label: 'Add Collateral' },
    { key: 'repay', label: 'Repay' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-1">Collateral Loans</h2>
        <p className="text-gray-500">Borrow USDC against your MNT collateral.</p>
      </div>

      {/* Liquidation warning banner */}
      {showWarning && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">
            Liquidation risk! Health factor is below 130%. Add collateral or repay part of your loan immediately.
          </p>
        </div>
      )}

      {/* Sticky health factor on mobile */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm pt-2 pb-1 -mx-4 px-4 sm:static sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:pt-0 sm:pb-0">
        <HealthFactor value={activeHealthFactor} label="Active Loan Health Factor" />
      </div>

      {/* Oracle price feed */}
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <span className="text-sm text-gray-600">Oracle Price:</span>
        <span className="font-semibold text-gray-800">1 MNT = {mntUsdcRate} USDC</span>
        <span className="ml-auto text-xs text-gray-400">Live feed</span>
      </div>

      {/* Active loan summary */}
      {activeLoan && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Collateral', value: `${activeLoan.collateral.toLocaleString()} MNT` },
            { label: 'Borrowed', value: `${activeLoan.borrowed.toFixed(2)} USDC` },
            { label: 'Repaid', value: `${activeLoan.repaid.toFixed(2)} USDC` },
            { label: 'Outstanding', value: `${outstanding.toFixed(2)} USDC` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="font-semibold text-gray-800 text-sm">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab forms */}
      <div>
        <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-4">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              disabled={t.key !== 'open' && !activeLoan}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                tab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <LoanForm
          mode={tab}
          collateralInput={collateralInput}
          onCollateralChange={setCollateralInput}
          borrowInput={borrowInput}
          onBorrowChange={setBorrowInput}
          previewHealthFactor={previewHealthFactor}
          mntBalance={mntBalance}
          usdcBalance={usdcBalance}
          addCollateralInput={addCollateralInput}
          onAddCollateralChange={setAddCollateralInput}
          repayInput={repayInput}
          onRepayChange={setRepayInput}
          outstanding={outstanding}
          onSubmit={tab === 'open' ? openLoan : tab === 'add-collateral' ? addCollateral : repayLoan}
          txStatus={txStatus}
          mntUsdcRate={mntUsdcRate}
        />
      </div>

      {/* Loan history */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Loan History</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                {['Date', 'Collateral', 'Borrowed', 'Repaid', 'Health', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">No history yet</td>
                </tr>
              ) : (
                history.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{row.openedAt}</td>
                    <td className="px-4 py-3">{row.collateral.toLocaleString()} MNT</td>
                    <td className="px-4 py-3">{row.borrowed.toFixed(2)} USDC</td>
                    <td className="px-4 py-3">{row.repaid.toFixed(2)} USDC</td>
                    <td className="px-4 py-3">{row.healthFactor.toFixed(0)}%</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadge[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollateralLoan;
