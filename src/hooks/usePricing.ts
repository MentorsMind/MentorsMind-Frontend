import { useState, useCallback, useMemo } from 'react';
import type { 
  PricingSettings, 
  PricingTier, 
  PackageBundle, 
  EarningsEstimate, 
  SessionType 
} from '../types/pricing.types';

const DEFAULT_PRICING: PricingSettings = {
  baseHourlyRate: 50,
  currency: 'USD',
  sessionTypePricing: [
    { type: '1:1', hourlyRate: 50, currency: 'USD', minRate: 20, maxRate: 500, isActive: true },
    { type: 'group', hourlyRate: 30, currency: 'USD', minRate: 10, maxRate: 200, isActive: true },
    { type: 'workshop', hourlyRate: 100, currency: 'USD', minRate: 50, maxRate: 1000, isActive: true },
  ],
  packages: [
    { id: '1', name: '5-Session Bundle', sessionCount: 5, discountPercentage: 10, totalPrice: 225, isActive: true },
    { id: '2', name: '10-Session Bundle', sessionCount: 10, discountPercentage: 15, totalPrice: 425, isActive: true },
  ],
  platformFeePercentage: 15,
  updatedAt: new Date().toISOString(),
};

export const usePricing = (initialSettings: PricingSettings = DEFAULT_PRICING) => {
  const [settings, setSettings] = useState<PricingSettings>(initialSettings);
  const [history, setHistory] = useState<any[]>([]);

  const updateBaseRate = useCallback((rate: number) => {
    setSettings((prev: PricingSettings) => ({
      ...prev,
      baseHourlyRate: rate,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateCurrency = useCallback((currency: string) => {
    setSettings((prev: PricingSettings) => ({
      ...prev,
      currency,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateSessionTypePrice = useCallback((type: SessionType, rate: number) => {
    setSettings((prev: PricingSettings) => ({
      ...prev,
      sessionTypePricing: prev.sessionTypePricing.map((tier: PricingTier) => 
        tier.type === type ? { ...tier, hourlyRate: rate } : tier
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updatePackage = useCallback((packageId: string, updates: Partial<PackageBundle>) => {
    setSettings((prev: PricingSettings) => ({
      ...prev,
      packages: prev.packages.map((pkg: PackageBundle) => 
        pkg.id === packageId ? { ...pkg, ...updates } : pkg
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const earningsEstimate = useMemo((): EarningsEstimate => {
    const projectedSessions = 10; // Default assumption for estimation
    const grossRevenue = settings.baseHourlyRate * projectedSessions;
    const platformFees = grossRevenue * (settings.platformFeePercentage / 100);
    
    return {
      projectedSessionsPerMonth: projectedSessions,
      estimatedGrossRevenue: grossRevenue,
      estimatedPlatformFees: platformFees,
      estimatedNetEarnings: grossRevenue - platformFees,
    };
  }, [settings.baseHourlyRate, settings.platformFeePercentage]);

  const validateRate = useCallback((type: SessionType, rate: number) => {
    const tier = settings.sessionTypePricing.find((t: PricingTier) => t.type === type);
    if (!tier) return false;
    return rate >= tier.minRate && rate <= tier.maxRate;
  }, [settings.sessionTypePricing]);

  const saveHistory = useCallback(() => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      baseHourlyRate: settings.baseHourlyRate,
      currency: settings.currency,
      changeDescription: 'Pricing updated',
    };
    setHistory((prev: any[]) => [newEntry, ...prev]);
  }, [settings.baseHourlyRate, settings.currency]);

  return {
    settings,
    earningsEstimate,
    history,
    updateBaseRate,
    updateCurrency,
    updateSessionTypePrice,
    updatePackage,
    validateRate,
    saveHistory,
  };
};
