import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import type { StellarAssetCode } from '../types/payment.types';

export interface QuoteData {
  asset: StellarAssetCode;
  basePrice: number;       // in asset units
  slippage: number;        // percentage e.g. 0.5 = 0.5%
  expiresAt: number;       // unix ms
}

export interface FeeEstimate {
  platformFee: number;     // in asset units
  networkFee: number;      // in asset units
}

export interface CheckoutQuote {
  quote: QuoteData | null;
  fees: FeeEstimate | null;
  total: number;
  loading: boolean;
  error: string | null;
  secondsLeft: number;
  refresh: () => void;
}

const REFRESH_INTERVAL = 15; // seconds

export function useCheckoutQuote(asset: StellarAssetCode, amountUSD: number): CheckoutQuote {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [fees, setFees] = useState<FeeEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [quoteRes, feeRes] = await Promise.all([
        api.get('/payments/quote', { params: { asset, amount: amountUSD } }),
        api.get('/payments/fee-estimate', { params: { asset } }),
      ]);
      setQuote(quoteRes.data.data ?? quoteRes.data);
      setFees(feeRes.data.data ?? feeRes.data);
      setSecondsLeft(REFRESH_INTERVAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  }, [asset, amountUSD]);

  // Auto-refresh every 15s
  useEffect(() => {
    fetchQuote();

    timerRef.current = setInterval(fetchQuote, REFRESH_INTERVAL * 1000);
    countdownRef.current = setInterval(() => {
      setSecondsLeft(s => (s <= 1 ? REFRESH_INTERVAL : s - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchQuote]);

  const total = quote && fees
    ? quote.basePrice + fees.platformFee + fees.networkFee
    : 0;

  return { quote, fees, total, loading, error, secondsLeft, refresh: fetchQuote };
}
