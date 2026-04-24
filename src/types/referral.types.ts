// Referral Types
export type RewardStatus = 'pending' | 'earned' | 'cancelled';

export interface ReferralInvite {
  id: string;
  inviteeEmail: string;
  inviteeId?: string;
  inviteeSentAt: Date;
  joinedAt?: Date;
  rewardStatus: RewardStatus;
  rewardAmount?: number;
}

export interface ReferralStats {
  totalInvitesSent: number;
  totalSignedUp: number;
  totalRewardsEarned: number;
  pendingRewards: number;
}

export interface ReferralResponse {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
  history: ReferralInvite[];
}

export interface ShareTemplate {
  platform: 'whatsapp' | 'twitter' | 'email';
  subject?: string;
  message: string;
  url: string;
}

export interface ReferralInvitePayload {
  referralCode: string;
  inviteeEmail?: string;
}
