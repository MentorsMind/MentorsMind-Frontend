import { useState, useCallback, useMemo } from 'react';
import { useWallet } from './useWallet';
import { createPayment, pollPaymentStatus, type PaymentRequest } from '../services/payment.service';
import { STELLAR_CONFIG, getAsset } from '../config/stellar.config';
import type { 
  PaymentDetails, 
  PaymentState, 
  PaymentStep, 
  StellarAssetCode, 
  StellarAsset,
  PaymentBreakdown,
} from '../types/payment.types';
import PaymentService from '../services/payment.service';

const PLATFORM_FEE_PERCENT = 0.05;
const QUOTE_REFRESH_THRESHOLD = 15; // seconds
const RATE_DRIFT_THRESHOLD = 0.01; // 1%

const ASSETS: Record<StellarAssetCode, StellarAsset> = {
  XLM:   { code: 'XLM',   name: 'Lumen',      icon: '🚀', balance: 450.25, priceInUSD: 0.12 },
  USDC:  { code: 'USDC',  name: 'USD Coin',    icon: '💵', balance: 125.50, priceInUSD: 1.00 },
  PYUSD: { code: 'PYUSD', name: 'PayPal USD',  icon: '🅿️', balance: 85.00,  priceInUSD: 1.00 },
};

const service = new PaymentService();

const newIdempotencyKey = () => crypto.randomUUID();

export const usePayment = (details: PaymentDetails) => {
  const { wallet, connectWallet: connectWalletHook, sendPayment } = useWallet();
  const [state, setState] = useState<PaymentState>({
    step: wallet ? 'method' : 'connect',
    selectedAsset: 'XLM',
    idempotencyKey: newIdempotencyKey(),
  });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshingRef = useRef(false);

  const selectedAssetData = useMemo(() => ASSETS[state.selectedAsset], [state.selectedAsset]);



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

  // ── Quote helpers ──────────────────────────────────────────────────────────

  const stopCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const fetchQuote = useCallback(async (prevReceiveAmount?: number) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setState(prev => ({ ...prev, quoteRefreshing: true, rateUpdated: false }));

    try {
      const quote = await service.getQuote(details.amount, state.selectedAsset);
      const secondsLeft = Math.max(
        0,
        Math.floor((new Date(quote.expiresAt).getTime() - Date.now()) / 1000),
      );

      const drifted =
        prevReceiveAmount !== undefined &&
        Math.abs(quote.receiveAmount - prevReceiveAmount) / prevReceiveAmount > RATE_DRIFT_THRESHOLD;

      setState(prev => ({
        ...prev,
        quote,
        quoteSecondsLeft: secondsLeft,
        quoteRefreshing: false,
        rateUpdated: drifted,
        previousReceiveAmount: drifted ? prevReceiveAmount : undefined,
      }));
    } catch {
      setState(prev => ({ ...prev, quoteRefreshing: false }));
    } finally {
      refreshingRef.current = false;
    }
  }, [details.amount, state.selectedAsset]);

  const startCountdown = useCallback((initialSeconds: number, currentReceiveAmount: number) => {
    stopCountdown();
    let seconds = initialSeconds;

    countdownRef.current = setInterval(async () => {
      seconds -= 1;
      setState(prev => ({ ...prev, quoteSecondsLeft: seconds }));

      if (seconds <= QUOTE_REFRESH_THRESHOLD && !refreshingRef.current) {
        stopCountdown();
        await fetchQuote(currentReceiveAmount);
        // Countdown restarts via the effect below once new quote lands
      }
    }, 1000);
  }, [stopCountdown, fetchQuote]);

  // Restart countdown whenever a fresh quote arrives
  useEffect(() => {
    if (state.quote && !state.quoteRefreshing && state.quoteSecondsLeft !== undefined) {
      startCountdown(state.quoteSecondsLeft, state.quote.receiveAmount);
    }
    return stopCountdown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.quote?.quoteId]);

  // ── Step transitions ───────────────────────────────────────────────────────

  const setStep = useCallback((step: PaymentStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const selectAsset = useCallback((asset: StellarAssetCode) => {
    setState(prev => ({ ...prev, selectedAsset: asset }));
  }, []);

  /** Called when user enters the review screen — fetch initial quote */
  const enterReview = useCallback(async (asset: StellarAssetCode) => {
    setState(prev => ({ ...prev, selectedAsset: asset, step: 'review' }));
    await fetchQuote();
  }, [fetchQuote]);

  // ── Payment ────────────────────────────────────────────────────────────────



  const processPayment = useCallback(async () => {
    // Guard against double-submission
    if (state.isSubmitting || state.step === 'processing') return;

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

    setState(prev => ({ ...prev, step: 'processing', isSubmitting: true, error: undefined }));

    try {
      // Send payment to the per-session escrow contract
      const escrowAccount = details.escrowContractId ?? STELLAR_CONFIG.contractId;
      
      const transaction = await sendPayment(
        escrowAccount,
        breakdown.totalAmount.toFixed(7),
        state.selectedAsset,
        `MentorMind Session: ${details.sessionId}`
      );

      // Create payment record on backend
      const paymentRequest: PaymentRequest = {
        sessionId: details.sessionId,
        mentorId: details.mentorId,
        amount: breakdown.totalAmount,
        assetCode: state.selectedAsset,
        transactionHash: transaction.hash,
      };

      const paymentResponse = await createPayment(paymentRequest);

      // Poll for payment confirmation
      const finalStatus = await pollPaymentStatus(
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
          isSubmitting: false,
          transactionHash: finalStatus.transactionHash 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          step: 'error', 
          isSubmitting: false,
          error: 'Payment confirmation timeout.' 
        }));
      }

    } catch (error) {
      console.error('Payment error:', error);
      setState(prev => ({ 
        ...prev, 
        step: 'error', 
        isSubmitting: false,
        error: error instanceof Error ? error.message : 'Payment failed.' 
      }));
    }
  }, [breakdown.totalAmount, selectedAssetData, state.selectedAsset, state.isSubmitting, state.step, wallet, connectWallet, sendPayment, details]);

  const retry = useCallback(() => {
    setState(prev => ({ ...prev, step: 'review', isSubmitting: false, error: undefined }));
  }, []);

  const reset = useCallback(() => {
    setState({
      step: 'method',
      selectedAsset: 'XLM',
      isSubmitting: false,
    });
  }, []);

  return {
    state,
    breakdown,
    assets,
    selectedAssetData,
    setStep,
    selectAsset,
    enterReview,
    connectWallet,
    processPayment,
    retry,
    reset,
  };
};
