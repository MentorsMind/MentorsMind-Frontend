import React, { useState } from 'react';
import SessionTypePrice from './SessionTypePrice';
import PackagePricing from './PackagePricing';
import EarningsCalculator from './EarningsCalculator';
import { usePricing } from '../../hooks/usePricing';

const PricingSettings: React.FC = () => {
  const { 
    settings, 
    earningsEstimate, 
    history,
    updateBaseRate, 
    updateCurrency, 
    updateSessionTypePrice, 
    updatePackage,
    saveHistory 
  } = usePricing();

  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2">
            Pricing <span className="text-blue-600">Strategy</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-md">
            Set flexible rates for different session types and create bundles to maximize your reach and earnings.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Currency</label>
          <select 
            value={settings.currency}
            onChange={(e) => updateCurrency(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-gray-900 dark:text-gray-100 focus:ring-0 cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="XLM">XLM (Stellar)</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Rate Card */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Session Rates</h2>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <SessionTypePrice 
                tiers={settings.sessionTypePricing}
                currency={settings.currency}
                onPriceChange={updateSessionTypePrice}
                onToggleActive={(type, active) => updatePackage(type, { isActive: active })} // Reusing logic for illustration
              />
            </div>
          </section>

          {/* Package Bundles */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none">
            <PackagePricing 
              packages={settings.packages}
              currency={settings.currency}
              onUpdatePackage={updatePackage}
            />
          </section>

          {showHistory && (
            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 border border-dashed border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Pricing History</h3>
              <div className="space-y-4">
                {history.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{entry.changeDescription}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                    <p className="font-mono text-sm font-bold text-blue-600">{entry.currency} {entry.baseHourlyRate}/hr</p>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No history available yet.</p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - Calculator & Preview */}
        <aside className="space-y-8">
          <EarningsCalculator 
            settings={settings}
            estimate={earningsEstimate}
            onSessionsChange={(count) => console.log('Projected sessions:', count)}
          />

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Learner View</h3>
              <div className="px-2 py-0.5 bg-green-500 rounded text-[8px] font-black uppercase">Live Preview</div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 p-0.5">
                  <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-bold">EM</div>
                </div>
                <div>
                  <h4 className="font-bold">Emma (You)</h4>
                  <p className="text-xs opacity-50 font-medium">Top Rated Mentor</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs opacity-60">Starting from</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">1:1 Session</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">{settings.currency} {settings.baseHourlyRate}</span>
                  <span className="text-sm opacity-60 font-medium">/ hour</span>
                </div>
              </div>

              <button 
                onClick={saveHistory}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all active:scale-95 shadow-lg shadow-blue-600/30"
              >
                SAVE ALL CHANGES
              </button>
              
              <p className="text-[10px] text-center opacity-40 leading-relaxed px-4">
                By saving, your new pricing will be visible to all learners immediately. Changes may take up to 24h to reflect in search results.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PricingSettings;
