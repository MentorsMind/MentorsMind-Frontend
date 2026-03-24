import { useState, useCallback, useMemo } from 'react';
import type { 
  PaymentDetails, 
  PaymentState, 
  PaymentStep, 
  StellarAssetCode, 
  StellarAsset,
  PaymentBreakdown 
} from '../types/payment.types';

const PLATFORM_FEE_PERCENT = 0.05; // 5%

const ASSETS: Record<StellarAssetCode, StellarAsset> = {
  XLM: { code: 'XLM', name: 'Lumen', icon: '🚀', balance: 450.25, priceInUSD: 0.12 },
  USDC: { code: 'USDC', name: 'USD Coin', icon: '💵', balance: 125.50, priceInUSD: 1.00 },
  PYUSD: { code: 'PYUSD', name: 'PayPal USD', icon: '🅿️', balance: 85.00, priceInUSD: 1.00 },
};

export const usePayment = (details: PaymentDetails) => {
  const [state, setState] = useState<PaymentState>({
    step: 'method',
    selectedAsset: 'XLM',
  });

  const selectedAssetData = useMemo(() => ASSETS[state.selectedAsset], [state.selectedAsset]);

  const breakdown = useMemo((): PaymentBreakdown => {
    const baseInAsset = details.amount / selectedAssetData.priceInUSD;
    const feeInAsset = baseInAsset * PLATFORM_FEE_PERCENT;
    return {
      baseAmount: baseInAsset,
      platformFee: feeInAsset,
      totalAmount: baseInAsset + feeInAsset,
      assetCode: state.selectedAsset,
    };
  }, [details.amount, selectedAssetData, state.selectedAsset]);

  const setStep = useCallback((step: PaymentStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const selectAsset = useCallback((asset: StellarAssetCode) => {
    setState(prev => ({ ...prev, selectedAsset: asset }));
  }, []);

  const processPayment = useCallback(async () => {
    if (selectedAssetData.balance < breakdown.totalAmount) {
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: `Insufficient ${state.selectedAsset} balance.` 
      }));
      return;
    }

    setState(prev => ({ ...prev, step: 'processing', error: undefined }));

    // Simulate Stellar network delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: 'Transaction failed on Stellar network. Please try again.' 
      }));
      return;
    }

    const mockHash = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    setState(prev => ({ 
      ...prev, 
      step: 'success', 
      transactionHash: mockHash 
    }));
  }, [breakdown.totalAmount, selectedAssetData.balance, state.selectedAsset]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, step: 'review', error: undefined }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 'method',
      selectedAsset: 'XLM',
    });
  }, []);

  return {
    state,
    breakdown,
    assets: Object.values(ASSETS),
    selectedAssetData,
    setStep,
    selectAsset,
    processPayment,
    retry,
    reset,
  };
};
