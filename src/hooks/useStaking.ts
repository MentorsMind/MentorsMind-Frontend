import { useState, useCallback, useMemo } from 'react';

export type StakingTier = 'None' | 'Bronze' | 'Silver' | 'Gold';

export interface TierBenefit {
  tier: StakingTier;
  minStake: number;
  feeDiscount: number; // Percentage
  visibilityBoost: string; 
  revenueShare: number; // Percentage
}

export const STAKING_TIERS: TierBenefit[] = [
  { tier: 'Bronze', minStake: 1000, feeDiscount: 10, visibilityBoost: 'Low', revenueShare: 1.5 },
  { tier: 'Silver', minStake: 5000, feeDiscount: 25, visibilityBoost: 'Medium', revenueShare: 3.0 },
  { tier: 'Gold', minStake: 20000, feeDiscount: 50, visibilityBoost: 'High', revenueShare: 5.0 },
];

export const getProjectedTier = (amount: number): StakingTier => {
  if (amount >= 20000) return 'Gold';
  if (amount >= 5000) return 'Silver';
  if (amount >= 1000) return 'Bronze';
  return 'None';
};

export interface StakePosition {
  amount: number;
  tier: StakingTier;
  unlockDate: string | null;
  lockPeriodDays: number | null;
}

export interface PendingReward {
  asset: string;
  amount: number;
}

export interface StakingHistoryEvent {
  id: string;
  action: 'Stake' | 'Stake More' | 'Unstake' | 'Claim';
  amount: number;
  asset: string;
  date: string;
  status: 'Completed' | 'Pending';
}

// Global APY calculation logic (mocked based on lock period & total pool)
export const calculateApy = (lockDays: number | null) => {
  if (!lockDays) return 5.0; // Base if not locked
  switch (lockDays) {
    case 30: return 8.5;
    case 90: return 12.0;
    case 180: return 18.5;
    default: return 5.0;
  }
};

export const useStaking = () => {
  // Simulate an initial active stake of 1,500 MNT unlocked in 10 days
  const [position, setPosition] = useState<StakePosition>({
    amount: 1500,
    tier: 'Bronze',
    unlockDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    lockPeriodDays: 30,
  });

  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([
    { asset: 'USDC', amount: 45.2 },
    { asset: 'XLM', amount: 150.5 },
  ]);

  const [history, setHistory] = useState<StakingHistoryEvent[]>([
    {
      id: 'tx-1001',
      action: 'Stake',
      amount: 1500,
      asset: 'MNT',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
    },
    {
      id: 'tx-1000',
      action: 'Claim',
      amount: 25.4,
      asset: 'USDC',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Completed',
    }
  ]);

  const currentApy = useMemo(() => calculateApy(position.lockPeriodDays), [position.lockPeriodDays]);
  const isLocked = position.unlockDate ? new Date(position.unlockDate).getTime() > Date.now() : false;

  const stake = useCallback((amount: number, days: number) => {
    setPosition(prev => {
      const newAmount = prev.amount + amount;
      // If staking more without resetting period, we keep the original unlockDate
      // but if the amount was 0, we create a new unlockDate
      const useExistingUnlock = prev.amount > 0 && prev.unlockDate !== null;
      
      const newUnlockDate = useExistingUnlock 
        ? prev.unlockDate 
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        
      const newLockPeriod = useExistingUnlock ? prev.lockPeriodDays : days;

      return {
        amount: newAmount,
        tier: getProjectedTier(newAmount),
        unlockDate: newUnlockDate,
        lockPeriodDays: newLockPeriod,
      };
    });

    setHistory(prev => [
      {
        id: `tx-${Date.now()}`,
        action: position.amount > 0 ? 'Stake More' : 'Stake',
        amount,
        asset: 'MNT',
        date: new Date().toISOString(),
        status: 'Completed',
      },
      ...prev
    ]);
  }, [position.amount]);

  const unstake = useCallback(() => {
    if (isLocked) return;

    setHistory(prev => [
      {
        id: `tx-${Date.now()}`,
        action: 'Unstake',
        amount: position.amount,
        asset: 'MNT',
        date: new Date().toISOString(),
        status: 'Completed',
      },
      ...prev
    ]);

    setPosition({
      amount: 0,
      tier: 'None',
      unlockDate: null,
      lockPeriodDays: null,
    });
  }, [isLocked, position.amount]);

  const claimRewards = useCallback((asset?: string) => {
    if (pendingRewards.length === 0) return;
    
    setHistory(prev => {
      const newEvents = asset 
        ? [
            {
              id: `tx-${Date.now()}`,
              action: 'Claim' as const,
              amount: pendingRewards.find(r => r.asset === asset)?.amount || 0,
              asset,
              date: new Date().toISOString(),
              status: 'Completed' as const,
            }
          ]
        : pendingRewards.map((reward, i) => ({
            id: `tx-${Date.now() + i}`,
            action: 'Claim' as const,
            amount: reward.amount,
            asset: reward.asset,
            date: new Date().toISOString(),
            status: 'Completed' as const,
          }));
      return [...newEvents, ...prev];
    });

    setPendingRewards(prev => asset ? prev.filter(r => r.asset !== asset) : []);
  }, [pendingRewards]);

  return {
    position,
    pendingRewards,
    history,
    currentApy,
    isLocked,
    stake,
    unstake,
    claimRewards,
  };
};
