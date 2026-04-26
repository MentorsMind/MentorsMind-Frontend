import React from 'react';
import { STAKING_TIERS } from '../../hooks/useStaking';
import { Check } from 'lucide-react';

const TierBenefits: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Tier Benefits</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider border-b border-gray-100 w-1/4">Benefit</th>
              {STAKING_TIERS.map(tier => (
                <th key={tier.tier} className="pb-4 font-bold text-center border-b border-gray-100 w-1/4">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs tracking-wider uppercase ${
                    tier.tier === 'Gold' ? 'bg-yellow-100 text-yellow-700' :
                    tier.tier === 'Silver' ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {tier.tier}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-1 font-medium select-none">
                    {tier.minStake.toLocaleString()} MNT
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr>
              <td className="py-5 border-b border-gray-50 font-semibold text-gray-700">Fee Discount</td>
              {STAKING_TIERS.map(tier => (
                <td key={`fee-${tier.tier}`} className="py-5 border-b border-gray-50 text-center font-bold text-gray-900">
                  {tier.feeDiscount}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-5 border-b border-gray-50 font-semibold text-gray-700">Visibility Boost</td>
              {STAKING_TIERS.map(tier => (
                <td key={`vis-${tier.tier}`} className="py-5 border-b border-gray-50 text-center font-bold text-gray-900">
                  {tier.visibilityBoost}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-5 font-semibold text-gray-700">Revenue Share</td>
              {STAKING_TIERS.map(tier => (
                <td key={`rev-${tier.tier}`} className="py-5 text-center font-bold text-green-600 flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  {tier.revenueShare}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm font-medium flex gap-3 leading-relaxed">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p>Staking MNT locks the tokens for your chosen duration. Your tier gets instantly upgraded when you cross the minimum required stake amount.</p>
      </div>
    </div>
  );
};

export default TierBenefits;
