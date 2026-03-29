import React, { useState, useEffect } from 'react';
import { useStaking } from '../hooks/useStaking';
import TierBenefits from '../components/wallet/TierBenefits';
import StakeForm from '../components/wallet/StakeForm';
import RewardsClaim from '../components/wallet/RewardsClaim';
import { Shield, Clock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

const Staking: React.FC = () => {
  const {
    position,
    pendingRewards,
    history,
    currentApy,
    isLocked,
    stake,
    unstake,
    claimRewards,
  } = useStaking();

  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!position.unlockDate) return;
    const interval = setInterval(() => {
      const lockEnd = new Date(position.unlockDate!).getTime();
      const now = Date.now();
      const diff = lockEnd - now;
      if (diff <= 0) {
        setTimeRemaining('Unlocked');
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        setTimeRemaining(`${days}d ${hours}h`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [position.unlockDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
          Mentor <span className="text-stellar">Staking</span>
          <Shield className="w-8 h-8 text-stellar" />
        </h1>
        <p className="text-gray-500 font-medium">
          Stake your MentorsMind Tokens (MNT) to upgrade your platform tier, earn yield, and unlock premium visibility.
        </p>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm col-span-1 md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-stellar/5 rounded-bl-[100px] -z-0"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 z-10 relative">Total Staked</p>
          <div className="flex items-end gap-3 z-10 relative">
            <span className="text-5xl font-black tracking-tight text-gray-900">{position.amount.toLocaleString()}</span>
            <span className="text-xl font-bold text-gray-400 mb-1">MNT</span>
          </div>
          
          <div className="mt-6 flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-xl text-sm font-bold tracking-wider uppercase border ${
              position.tier === 'Gold' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' :
              position.tier === 'Silver' ? 'bg-gray-100 border-gray-200 text-gray-700' :
              position.tier === 'Bronze' ? 'bg-orange-100 border-orange-200 text-orange-800' :
              'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              {position.tier} Tier
            </div>
            
            {position.lockPeriodDays && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                <Clock className="w-4 h-4" />
                Locked for {position.lockPeriodDays} Days
              </div>
            )}
          </div>
        </div>

        <div className="bg-stellar text-white p-6 rounded-3xl shadow-lg shadow-stellar/20 flex flex-col justify-center">
          <p className="text-blue-100 font-bold text-sm tracking-widest uppercase mb-2">Current APY</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black">{currentApy.toFixed(1)}%</span>
            <TrendingUp className="w-6 h-6 mb-1 text-blue-200" />
          </div>
          <p className="text-blue-200 text-xs font-medium mt-3">Dynamic rate based on lock period & pool size</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Unstake Availability</p>
          {position.amount === 0 ? (
            <span className="text-gray-400 font-medium">No active stake</span>
          ) : isLocked ? (
            <>
              <div className="text-2xl font-black text-gray-900 mb-1">{timeRemaining}</div>
              <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> Locked
              </p>
            </>
          ) : (
            <div className="text-green-500 font-black text-lg py-2">Unlocked</div>
          )}
          
          <button
            onClick={unstake}
            disabled={isLocked || position.amount === 0}
            className={`mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
              isLocked || position.amount === 0
                ? 'bg-gray-50 text-gray-400'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
            }`}
          >
            Unstake Tokens
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column forms */}
        <div className="lg:col-span-5 space-y-8">
          <StakeForm 
            currentAmount={position.amount} 
            isInitialStake={position.amount === 0} 
            onStake={stake} 
          />
          <RewardsClaim 
            rewards={pendingRewards}
            onClaim={claimRewards}
          />
        </div>

        {/* Right Column details */}
        <div className="lg:col-span-7 space-y-8">
          <TierBenefits />

          {/* Staking History */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-400" />
              Staking History
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Action</th>
                    <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider">Amount</th>
                    <th className="pb-4 font-bold text-gray-500 uppercase text-xs tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {history.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium text-gray-500">
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                          tx.action === 'Stake' || tx.action === 'Stake More' ? 'bg-stellar/10 text-stellar' :
                          tx.action === 'Claim' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {tx.action}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-gray-900">
                        {tx.amount.toLocaleString()} <span className="text-gray-400 text-xs font-medium">{tx.asset}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-xs font-bold tracking-wider uppercase text-green-500">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 text-sm font-medium">
                        No staking history available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Staking;
