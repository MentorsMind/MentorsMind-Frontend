import React, { useState, useMemo } from 'react';
import { useStaking, getProjectedTier } from '../../hooks/useStaking';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface StakeFormProps {
  currentAmount: number;
  isInitialStake: boolean;
  onStake: (amount: number, days: number) => void;
}

const StakeForm: React.FC<StakeFormProps> = ({ currentAmount, isInitialStake, onStake }) => {
  const [amountInput, setAmountInput] = useState<string>('');
  const [lockDays, setLockDays] = useState<number>(30); // 30, 90, 180

  const handleMax = () => setAmountInput('25000'); // Mocked wallet balance max
  
  const parsedAmount = Number(amountInput) || 0;
  const projectedTier = useMemo(() => getProjectedTier(currentAmount + parsedAmount), [currentAmount, parsedAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    onStake(parsedAmount, lockDays);
    setAmountInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-stellar/10 p-2.5 rounded-2xl text-stellar">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isInitialStake ? 'Stake MNT' : 'Stake More MNT'}</h2>
          <p className="text-sm text-gray-500">Lock tokens to upgrade tier & earn yield</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-sm font-bold text-gray-700">Amount to Stake</label>
            <span className="text-xs font-semibold text-gray-400">Bal: 25,000 MNT</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full pl-5 pr-20 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-stellar/20 focus:border-stellar transition-all"
            />
            <button
              type="button"
              onClick={handleMax}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stellar bg-stellar/10 hover:bg-stellar/20 px-3 py-1.5 rounded-xl transition-all"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Lock Period Selector */}
        {isInitialStake && (
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-3">Select Lock Period</label>
            <div className="grid grid-cols-3 gap-3">
              {[30, 90, 180].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setLockDays(days)}
                  className={`py-3 rounded-xl text-sm font-bold border transition-all ${
                    lockDays === days 
                      ? 'bg-stellar text-white border-stellar shadow-md shadow-stellar/20' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-stellar/50 hover:bg-gray-50'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tier Upgrade Preview */}
        {parsedAmount > 0 && (
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Projected Tier</div>
              <div className={`font-black text-lg ${
                projectedTier === 'Gold' ? 'text-yellow-600' :
                projectedTier === 'Silver' ? 'text-gray-600' :
                projectedTier === 'Bronze' ? 'text-orange-700' : 'text-gray-400'
              }`}>
                {projectedTier}
              </div>
            </div>
            
            <div className="bg-white p-2 border border-gray-200 rounded-full text-gray-400">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">New Total Stake</div>
              <div className="font-bold text-gray-900 text-lg">{(currentAmount + parsedAmount).toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={parsedAmount <= 0}
          className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-gray-900/10 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isInitialStake ? 'Stake & Lock Tokens' : 'Stake More Tokens'}
          <ShieldCheck className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default StakeForm;
