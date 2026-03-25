import { useState, useCallback, useMemo } from 'react';
import type { StellarAssetCode, StellarAsset } from '../types/payment.types';

export interface AssetWithMeta extends StellarAsset {
  priceChange24h: number; // percentage
  volume24h: number;
  trustlineEstablished: boolean;
  minBalance: number;
  maxSendLimit: number;
  issuer?: string;
}

export interface AssetPreferences {
  defaultAsset: StellarAssetCode;
  showSmallBalances: boolean;
  preferredCurrency: 'USD' | 'EUR' | 'GBP';
}

const FX_RATES: Record<AssetPreferences['preferredCurrency'], number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS: Record<AssetPreferences['preferredCurrency'], string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const MOCK_ASSETS: AssetWithMeta[] = [
  {
    code: 'XLM',
    name: 'Lumen',
    icon: '🚀',
    balance: 450.25,
    priceInUSD: 0.12,
    priceChange24h: 3.4,
    volume24h: 48_200_000,
    trustlineEstablished: true,
    minBalance: 1,
    maxSendLimit: 10_000,
    issuer: undefined,
  },
  {
    code: 'USDC',
    name: 'USD Coin',
    icon: '💵',
    balance: 125.5,
    priceInUSD: 1.0,
    priceChange24h: 0.01,
    volume24h: 2_100_000_000,
    trustlineEstablished: true,
    minBalance: 0.5,
    maxSendLimit: 50_000,
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
  {
    code: 'PYUSD',
    name: 'PayPal USD',
    icon: '🅿️',
    balance: 85.0,
    priceInUSD: 1.0,
    priceChange24h: -0.02,
    volume24h: 320_000_000,
    trustlineEstablished: false,
    minBalance: 0.5,
    maxSendLimit: 25_000,
    issuer: 'GACVHHKJSXMBGMGKPF2XJMMFK5GQZCRNMGYW2JTQM6XQQYAPQBDQBKN',
  },
];

export function useAssets() {
  const [assets] = useState<AssetWithMeta[]>(MOCK_ASSETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<StellarAssetCode>('XLM');
  const [preferences, setPreferences] = useState<AssetPreferences>({
    defaultAsset: 'XLM',
    showSmallBalances: true,
    preferredCurrency: 'USD',
  });
  const [trustlineStatus, setTrustlineStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return assets.filter(a => {
      const matchesSearch = !q || a.code.toLowerCase().includes(q) || a.name.toLowerCase().includes(q);
      const matchesBalance = preferences.showSmallBalances || a.balance > 0;
      return matchesSearch && matchesBalance;
    });
  }, [assets, searchQuery, preferences.showSmallBalances]);

  const selectedAssetData = useMemo(
    () => assets.find(a => a.code === selectedAsset) ?? assets[0],
    [assets, selectedAsset]
  );

  const fxRate = FX_RATES[preferences.preferredCurrency];
  const currencySymbol = CURRENCY_SYMBOLS[preferences.preferredCurrency];

  const getConvertedValue = useCallback(
    (usdAmount: number) => usdAmount * fxRate,
    [fxRate]
  );

  const getConversionPreview = useCallback(
    (fromCode: StellarAssetCode, toCode: StellarAssetCode, amount: number) => {
      const from = assets.find(a => a.code === fromCode);
      const to = assets.find(a => a.code === toCode);
      if (!from || !to || to.priceInUSD === 0) return 0;
      return (amount * from.priceInUSD) / to.priceInUSD;
    },
    [assets]
  );

  const setupTrustline = useCallback(async (assetCode: StellarAssetCode) => {
    setTrustlineStatus('loading');
    // Simulate network call
    await new Promise(r => setTimeout(r, 1800));
    setTrustlineStatus('success');
    setTimeout(() => setTrustlineStatus('idle'), 3000);
  }, []);

  const updatePreferences = useCallback((updates: Partial<AssetPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    assets,
    filteredAssets,
    searchQuery,
    setSearchQuery,
    selectedAsset,
    setSelectedAsset,
    selectedAssetData,
    preferences,
    updatePreferences,
    currencySymbol,
    getConvertedValue,
    getConversionPreview,
    trustlineStatus,
    setupTrustline,
  };
}
