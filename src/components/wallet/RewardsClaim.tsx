import React from 'react';
import { Gift, Coins } from 'lucide-react';
import type { PendingReward } from '../../hooks/useStaking';

interface RewardsClaimProps {
  rewards: PendingReward[];
  onClaim: (asset?: string) => void;
}

const RewardsClaim: React.FC<RewardsClaimProps> = ({ rewards, onClaim }) => {
  const totalFiatEstimate = rewards.reduce((acc, r) => acc + r.amount * (r.asset === 'XLM' ? 0.35 : 1.0), 0);

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
          <Gift className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Pending Rewards</h3>
        <p className="text-sm text-gray-500 max-w-[200px] mt-2">Check back later once your staked tier generates revenue share.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-stellar to-blue-700 rounded-3xl p-8 shadow-xl shadow-stellar/20 text-white relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10 pointer-events-none">
        <svg fill="currentColor" viewBox="0 0 100 100" className="w-64 h-64">
          <circle cx="50" cy="50" r="50"></circle>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6 text-blue-100">
          <Coins className="w-5 h-5" />
          <span className="font-bold text-sm tracking-wider uppercase">Pending Yield</span>
        </div>

        <div className="mb-8">
          <div className="text-4xl font-black tracking-tight mb-2">
            ${totalFiatEstimate.toFixed(2)}
          </div>
          <p className="text-blue-200 text-sm font-medium">Estimated fiat value</p>
        </div>

        <div className="space-y-3 mb-8 flex-1">
          {rewards.map((reward) => (
            <div key={reward.asset} className="flex items-center justify-between bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="font-bold">
                <span className="text-xl mr-1">{reward.amount.toLocaleString()}</span>
                <span className="text-xs text-blue-200">{reward.asset}</span>
              </div>
              <button
                onClick={() => onClaim(reward.asset)}
                className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-xl shadow hover:bg-blue-50 transition-all active:scale-95"
              >
                Claim
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => onClaim()}
          className="w-full py-4 text-sm font-bold bg-gray-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg shadow-black/20"
        >
          Claim All Rewards
        </button>
      </div>
    </div>
  );
};

export default RewardsClaim;
