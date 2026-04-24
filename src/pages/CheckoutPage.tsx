import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { StellarAssetCode } from '../types/payment.types';
import { useCheckoutQuote } from '../hooks/useCheckoutQuote';
import { usePayment } from '../hooks/usePayment';
import AssetSelector from '../components/checkout/AssetSelector';
import CheckoutSummaryCard from '../components/checkout/CheckoutSummaryCard';
import QuoteTimer from '../components/checkout/QuoteTimer';
import SlippageWarning from '../components/checkout/SlippageWarning';
import ErrorBanner from '../components/checkout/ErrorBanner';
import SuccessScreen from '../components/checkout/SuccessScreen';

interface CheckoutLocationState {
  mentorId: string;
  mentorName: string;
  sessionId: string;
  sessionTopic: string;
  durationMinutes: number;
  amountUSD: number;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state as CheckoutLocationState | null;

  const [asset, setAsset] = useState<StellarAssetCode>('XLM');
  const [agreed, setAgreed] = useState(false);

  // Fallback for direct navigation without state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg">No session data found.</p>
          <button onClick={() => navigate('/mentors')} className="mt-4 text-indigo-600 underline text-sm">
            Browse mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <CheckoutContent session={session} asset={asset} setAsset={setAsset} agreed={agreed} setAgreed={setAgreed} />
  );
}

// Separate inner component so hooks run after guard
function CheckoutContent({
  session, asset, setAsset, agreed, setAgreed,
}: {
  session: CheckoutLocationState;
  asset: StellarAssetCode;
  setAsset: (a: StellarAssetCode) => void;
  agreed: boolean;
  setAgreed: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const { quote, fees, loading, error: quoteError, secondsLeft, refresh } = useCheckoutQuote(asset, session.amountUSD);

  const paymentDetails = {
    mentorId: session.mentorId,
    mentorName: session.mentorName,
    sessionId: session.sessionId,
    sessionTopic: session.sessionTopic,
    amount: session.amountUSD,
  };

  const { state: payState, processPayment, retry } = usePayment(paymentDetails);

  const handleAssetChange = (newAsset: StellarAssetCode) => {
    setAsset(newAsset);
  };

  const canConfirm = agreed && !loading && quote !== null && fees !== null && payState.step !== 'processing';

  if (payState.step === 'success' && payState.transactionHash) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <SuccessScreen txHash={payState.transactionHash} mentorName={session.mentorName} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
        </div>

        {/* Asset selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">Pay with</p>
          <AssetSelector selected={asset} onChange={handleAssetChange} disabled={payState.step === 'processing'} />
        </div>

        {/* Quote timer */}
        <div className="px-1">
          <QuoteTimer secondsLeft={secondsLeft} onRefresh={refresh} />
        </div>

        {/* Slippage warning */}
        {quote && <SlippageWarning slippage={quote.slippage} />}

        {/* Quote / fee error */}
        {quoteError && <ErrorBanner error={quoteError} onRetry={refresh} />}

        {/* Payment error */}
        {payState.step === 'error' && payState.error && (
          <ErrorBanner error={payState.error} onRetry={retry} />
        )}

        {/* Summary card */}
        <CheckoutSummaryCard
          mentorName={session.mentorName}
          sessionTopic={session.sessionTopic}
          durationMinutes={session.durationMinutes}
          asset={asset}
          quote={quote}
          fees={fees}
          loading={loading}
        />

        {/* Agreement checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            I have reviewed the payment breakdown and agree to proceed.
          </span>
        </label>

        {/* Confirm button */}
        <button
          onClick={processPayment}
          disabled={!canConfirm}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors
            ${canConfirm
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {payState.step === 'processing'
            ? <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </span>
            : 'Confirm Payment'}
        </button>

      </div>
    </div>
  );
}
