import React from 'react';
import type { SessionType, PricingTier } from '../../types/pricing.types';

interface SessionTypePriceProps {
  tiers: PricingTier[];
  currency: string;
  onPriceChange: (type: SessionType, rate: number) => void;
  onToggleActive: (type: SessionType, active: boolean) => void;
}

const SessionTypePrice: React.FC<SessionTypePriceProps> = ({ tiers, currency, onPriceChange, onToggleActive }) => {
  return (
    <div className="space-y-4">
      {tiers.map((tier) => (
        <div 
          key={tier.type}
          className={`p-5 rounded-2xl border transition-all duration-200 ${
            tier.isActive 
              ? 'bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-50 dark:ring-blue-900/10' 
              : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 grayscale'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${
                tier.type === '1:1' ? 'bg-purple-100 text-purple-600' :
                tier.type === 'group' ? 'bg-green-100 text-green-600' :
                'bg-orange-100 text-orange-600'
              } dark:bg-opacity-20`}>
                {tier.type === '1:1' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
                {tier.type === 'group' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
                {tier.type === 'workshop' && (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100">{tier.type === '1:1' ? 'One-on-One' : tier.type.charAt(0).toUpperCase() + tier.type.slice(1)}</h4>
                <p className="text-xs text-gray-500 font-medium">{tier.type === '1:1' ? 'Personalized mentorship' : tier.type === 'group' ? 'Interactive group learning' : 'Deep dive intensive sessions'}</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={tier.isActive}
                onChange={(e) => onToggleActive(tier.type, e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative mt-1 rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 font-semibold">
                  {currency}
                </div>
                <input
                  type="number"
                  value={tier.hourlyRate}
                  onChange={(e) => onPriceChange(tier.type, parseFloat(e.target.value))}
                  disabled={!tier.isActive}
                  className="block w-full rounded-xl border-0 py-3 pl-12 pr-12 text-gray-900 dark:text-gray-100 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white dark:bg-gray-900 disabled:opacity-50"
                  placeholder="0.00"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500 sm:text-sm font-medium">/ hr</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-4 text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            <span>Min: {currency}{tier.minRate}</span>
            <span>Max: {currency}{tier.maxRate}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SessionTypePrice;
