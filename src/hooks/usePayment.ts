import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  const [state, setState] = useState<PaymentState>({
    step: 'method',
    selectedAsset: 'XLM',
    idempotencyKey: newIdempotencyKey(),
  });

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refreshingRef = useRef(false);

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
    if (selectedAssetData.balance < breakdown.totalAmount) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: `Insufficient ${state.selectedAsset} balance.`,
      }));
      return;
    }

    if (!state.quote) return;

    stopCountdown();
    setState(prev => ({ ...prev, step: 'processing', error: undefined }));

    try {
      const { data, replayed } = await service.pay(
        { amount: details.amount, quoteId: state.quote.quoteId, assetCode: state.selectedAsset },
        state.idempotencyKey!,
      );

      if (data.status === 'success' || replayed) {
        setState(prev => ({
          ...prev,
          step: 'success',
          transactionHash: data.transactionHash ?? 'replayed',
        }));
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message: string = err?.response?.data?.message ?? '';

      if (status === 409 && message.toLowerCase().includes('rate')) {
        // Rate drifted — silently refresh quote and re-present review
        const prev = state.quote.receiveAmount;
        setState(s => ({ ...s, step: 'review' }));
        await fetchQuote(prev);
      } else {
        setState(prev => ({
          ...prev,
          step: 'error',
          error: message || 'Transaction failed on Stellar network. Please try again.',
        }));
      }
    }
  }, [
    breakdown.totalAmount,
    details.amount,
    fetchQuote,
    selectedAssetData.balance,
    state.idempotencyKey,
    state.quote,
    state.selectedAsset,
    stopCountdown,
  ]);

  /** Retry: generate a fresh idempotency key and go back to review */
  const retry = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: 'review',
      error: undefined,
      idempotencyKey: newIdempotencyKey(),
    }));
  }, []);

  const reset = useCallback(() => {
    stopCountdown();
    setState({ step: 'method', selectedAsset: 'XLM', idempotencyKey: newIdempotencyKey() });
  }, [stopCountdown]);

  return {
    state,
    breakdown,
    assets: Object.values(ASSETS),
    selectedAssetData,
    setStep,
    selectAsset,
    enterReview,
    processPayment,
    retry,
    reset,
  };
};
