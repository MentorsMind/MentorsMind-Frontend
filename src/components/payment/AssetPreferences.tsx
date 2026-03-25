import React from 'react';
import { Settings2 } from 'lucide-react';
import type { AssetPreferences } from '../../hooks/useAssets';

interface AssetPreferencesProps {
  preferences: AssetPreferences;
  onChange: (updates: Partial<AssetPreferences>) => void;
}

const CURRENCIES: AssetPreferences['preferredCurrency'][] = ['USD', 'EUR', 'GBP'];

const AssetPreferencesPanel: React.FC<AssetPreferencesProps> = ({ preferences, onChange }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="w-4 h-4 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">Asset Preferences</p>
      </div>

      {/* Currency selector */}
      <div>
        <p className="text-xs text-gray-500 mb-2">Display currency</p>
        <div className="flex gap-2">
          {CURRENCIES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ preferredCurrency: c })}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-150 ${
                preferences.preferredCurrency === c
                  ? 'bg-stellar text-white border-stellar'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Show small balances toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700">Show small balances</p>
          <p className="text-[10px] text-gray-400">Include assets with zero balance</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={preferences.showSmallBalances}
          onClick={() => onChange({ showSmallBalances: !preferences.showSmallBalances })}
          className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
            preferences.showSmallBalances ? 'bg-stellar' : 'bg-gray-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              preferences.showSmallBalances ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default AssetPreferencesPanel;
