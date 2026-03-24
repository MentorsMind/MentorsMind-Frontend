export type SessionType = '1:1' | 'group' | 'workshop';

export interface PricingTier {
  type: SessionType;
  hourlyRate: number;
  currency: string;
  minRate: number;
  maxRate: number;
  isActive: boolean;
}

export interface PackageBundle {
  id: string;
  name: string;
  sessionCount: number;
  discountPercentage: number;
  totalPrice: number;
  isActive: boolean;
}

export interface PricingHistory {
  id: string;
  date: string;
  baseHourlyRate: number;
  currency: string;
  changeDescription: string;
}

export interface PricingSettings {
  baseHourlyRate: number;
  currency: string;
  sessionTypePricing: PricingTier[];
  packages: PackageBundle[];
  platformFeePercentage: number;
  updatedAt: string;
}

export interface EarningsEstimate {
  projectedSessionsPerMonth: number;
  estimatedGrossRevenue: number;
  estimatedPlatformFees: number;
  estimatedNetEarnings: number;
}
