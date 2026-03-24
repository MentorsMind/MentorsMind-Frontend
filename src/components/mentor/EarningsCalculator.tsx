import React from 'react';
import type { EarningsEstimate, PricingSettings } from '../../types/pricing.types';

interface EarningsCalculatorProps {
  settings: PricingSettings;
  estimate: EarningsEstimate;
  onSessionsChange: (count: number) => void;
}

const EarningsCalculator: React.FC<EarningsCalculatorProps> = ({ settings, estimate, onSessionsChange }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </span>
        Earnings Estimate Calculator
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Projected Monthly Sessions
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={estimate.projectedSessionsPerMonth}
            onChange={(e) => onSessionsChange(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>1 session</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{estimate.projectedSessionsPerMonth} sessions</span>
            <span>100 sessions</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Gross Revenue</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {settings.currency} {estimate.estimatedGrossRevenue.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-red-500 uppercase tracking-wider font-semibold mb-1">Platform Fee ({settings.platformFeePercentage}%)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              - {settings.currency} {estimate.estimatedPlatformFees.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg shadow-blue-500/20">
          <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">Estimated Net Earnings</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">
              {settings.currency} {estimate.estimatedNetEarnings.toLocaleString()}
            </span>
            <span className="text-sm opacity-80">/ month</span>
          </div>
          <p className="mt-4 text-xs opacity-70 leading-relaxed italic">
            * Estimates are based on your base hourly rate and default platform fees. Actual earnings may vary based on session types and package discounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarningsCalculator;
