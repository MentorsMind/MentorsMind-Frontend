import { useState, useCallback, useMemo } from 'react';
import { useWallet } from './useWallet';
import PaymentService, { type PaymentRequest } from '../services/payment.service';
import { STELLAR_CONFIG, getAsset } from '../config/stellar.config';
import type { 
  PaymentDetails, 
  PaymentState, 
  PaymentStep, 
  StellarAssetCode, 
  StellarAsset,
  PaymentBreakdown 
} from '../types/payment.types';

const PLATFORM_FEE_PERCENT = 0.05; // 5%

export const usePayment = (details: PaymentDetails) => {
  const { wallet, connectWallet: connectWalletHook, sendPayment } = useWallet();
  const [state, setState] = useState<PaymentState>({
    step: wallet ? 'method' : 'connect',
    selectedAsset: 'XLM',
  });

  const assets = useMemo((): StellarAsset[] => {
    if (!wallet?.balance) return [];

    return wallet.balance
      .filter(balance => ['XLM', 'USDC', 'PYUSD'].includes(balance.assetCode))
      .map(balance => {
        const assetConfig = getAsset(balance.assetCode as StellarAssetCode);
        return {
          code: balance.assetCode as StellarAssetCode,
          name: assetConfig.name,
          icon: assetConfig.icon,
          balance: parseFloat(balance.balance),
          priceInUSD: balance.assetCode === 'XLM' ? 0.12 : 1.00, // Simplified pricing
        };
      });
  }, [wallet?.balance]);

  const selectedAssetData = useMemo(() => 
    assets.find(asset => asset.code === state.selectedAsset) || assets[0],
    [assets, state.selectedAsset]
  );

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

  const connectWallet = useCallback(async () => {
    try {
      await connectWalletHook();
      setState(prev => ({ ...prev, step: 'method' }));
    } catch (error) {
      console.error('Wallet connection error:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Failed to connect wallet' 
      }));
    }
  }, [connectWalletHook]);

  const processPayment = useCallback(async () => {
    if (!selectedAssetData) {
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: 'No asset selected.' 
      }));
      return;
    }

    if (selectedAssetData.balance < breakdown.totalAmount) {
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: `Insufficient ${state.selectedAsset} balance.` 
      }));
      return;
    }

    // Ensure wallet is connected
    if (!wallet) {
      try {
        await connectWalletHook();
      } catch (error) {
        console.error('Wallet connection error:', error);
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: 'Please connect your Freighter wallet to proceed.' 
        }));
        return;
      }
    }

    setState(prev => ({ ...prev, step: 'processing', error: undefined }));

    try {
      // Send payment to escrow account (this would be the platform's escrow account)
      const escrowAccount = STELLAR_CONFIG.platformFeeAccount; // In real implementation, this would be generated per session
      
      const transaction = await sendPayment(
        escrowAccount,
        breakdown.totalAmount.toFixed(7),
        state.selectedAsset,
        `MentorMind Session: ${details.sessionId}`
      );

      // Create payment record on backend
      const paymentService = new PaymentService();
      const paymentRequest: PaymentRequest = {
        sessionId: details.sessionId,
        mentorId: details.mentorId,
        amount: breakdown.totalAmount,
        assetCode: state.selectedAsset,
        transactionHash: transaction.hash,
      };

      const paymentResponse = await paymentService.createPayment(paymentRequest);

      // Poll for payment confirmation
      const finalStatus = await paymentService.pollPaymentStatus(
        paymentResponse.paymentId,
        (status) => {
          if (status.status === 'failed') {
            setState(prev => ({ 
              ...prev, 
              step: 'error', 
              error: 'Payment failed to confirm on Stellar network.' 
            }));
          }
        }
      );

      if (finalStatus.status === 'confirmed') {
        setState(prev => ({ 
          ...prev, 
          step: 'success', 
          transactionHash: finalStatus.transactionHash 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          error: 'Payment confirmation timeout.' 
        }));
      }

    } catch (error) {
      console.error('Payment error:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        error: error instanceof Error ? error.message : 'Payment failed.' 
      }));
    }
  }, [breakdown.totalAmount, selectedAssetData, state.selectedAsset, wallet, connectWallet, sendPayment, details]);

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
    assets,
    selectedAssetData,
    setStep,
    selectAsset,
    connectWallet,
    processPayment,
    retry,
    reset,
  };
};
