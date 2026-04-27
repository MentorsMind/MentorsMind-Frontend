import React from 'react';
import { Users, UserCheck, Gift } from 'lucide-react';
import type { ReferralStats } from '../../types/referral.types';

interface ReferralStatsProps {
  stats: ReferralStats;
  isLoading?: boolean;
}

export const ReferralStats: React.FC<ReferralStatsProps> = ({
  stats,
  isLoading = false,
}) => {
  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: number;
    subtext?: string;
  }> = ({ icon, label, value, subtext }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-gray-500">{subtext}</p>
          )}
        </div>
        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">{icon}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-gray-200"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatCard
        icon={<Users className="h-6 w-6" />}
        label="Invites Sent"
        value={stats.totalInvitesSent}
        subtext="Total friends invited"
      />
      <StatCard
        icon={<UserCheck className="h-6 w-6" />}
        label="Signed Up"
        value={stats.totalSignedUp}
        subtext="Friends who joined"
      />
      <StatCard
        icon={<Gift className="h-6 w-6" />}
        label="Rewards Earned"
        value={stats.totalRewardsEarned}
        subtext={`${stats.pendingRewards} pending`}
      />
    </div>
  );
};
