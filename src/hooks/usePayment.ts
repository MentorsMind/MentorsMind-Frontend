import { useState, useCallback } from 'react';
import type { PaymentDetails, PaymentState, StellarAssetCode, StellarAsset, PaymentBreakdown } from '../types/payment.types';

export const usePayment = (details: PaymentDetails) => {
  const [state, setState] = useState<PaymentState>({
    step: 'method',
    selectedAsset: 'XLM',
    isSubmitting: false,
  });

  const assets: StellarAsset[] = [
    { code: 'XLM', name: 'Lumen', icon: '🚀', balance: 450.25, priceInUSD: 0.12 },
    { code: 'USDC', name: 'USD Coin', icon: '💵', balance: 125.50, priceInUSD: 1.00 },
    { code: 'PYUSD', name: 'PayPal USD', icon: '🅿️', balance: 85.00, priceInUSD: 1.00 },
  ];

  const selectedAssetData = assets.find(a => a.code === state.selectedAsset) || assets[0];

  const breakdown: PaymentBreakdown = {
    baseAmount: details.amount,
    platformFee: details.amount * 0.05,
    totalAmount: details.amount * 1.05,
    assetCode: state.selectedAsset,
  };

  const setStep = useCallback((step: any) => setState(prev => ({ ...prev, step })), []);
  const selectAsset = useCallback((asset: StellarAssetCode) => setState(prev => ({ ...prev, selectedAsset: asset })), []);
  const enterReview = useCallback((asset: StellarAssetCode) => setState(prev => ({ ...prev, selectedAsset: asset, step: 'review' })), []);
  const processPayment = useCallback(async () => {
    setState(prev => ({ ...prev, step: 'processing', isSubmitting: true }));
    await new Promise(r => setTimeout(r, 2000));
    setState(prev => ({ ...prev, step: 'success', isSubmitting: false, transactionHash: 'MOCK_TX_HASH' }));
  }, []);
  const retry = useCallback(() => setState(prev => ({ ...prev, step: 'review', isSubmitting: false })), []);
  const reset = useCallback(() => setState({ step: 'method', selectedAsset: 'XLM', isSubmitting: false }), []);

  return {
    state,
    breakdown,
    assets,
    selectedAssetData,
    setStep,
    selectAsset,
    enterReview,
    processPayment,
    retry,
    reset,
  };
};
