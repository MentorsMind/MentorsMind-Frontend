import React from 'react';
import type { PackageBundle } from '../../types/pricing.types';

interface PackagePricingProps {
  packages: PackageBundle[];
  currency: string;
  onUpdatePackage: (id: string, updates: Partial<PackageBundle>) => void;
}

const PackagePricing: React.FC<PackagePricingProps> = ({ packages, currency, onUpdatePackage }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 italic">Bundle Savings</h3>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full tracking-wider uppercase">Boost Bookings</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => (
          <div 
            key={pkg.id}
            className={`relative p-6 rounded-3xl border transition-all duration-300 ${
              pkg.isActive 
                ? 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-blue-900/30' 
                : 'bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-60'
            } group`}
          >
            {pkg.discountPercentage > 10 && (
              <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-black rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                BEST VALUE
              </div>
            )}

            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">{pkg.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{pkg.sessionCount} Sessions</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">Save {pkg.discountPercentage}%</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={pkg.isActive}
                  onChange={(e) => onUpdatePackage(pkg.id, { isActive: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Discount Setting (%)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={pkg.discountPercentage}
                    onChange={(e) => onUpdatePackage(pkg.id, { discountPercentage: parseInt(e.target.value) })}
                    disabled={!pkg.isActive}
                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-sm font-black text-gray-900 dark:text-gray-100 min-w-[3ch]">{pkg.discountPercentage}%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Learner Price:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-medium text-gray-400 line-through">
                      {currency}{(pkg.totalPrice / (1 - pkg.discountPercentage / 100)).toFixed(0)}
                    </span>
                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                      {currency}{pkg.totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PackagePricing;
