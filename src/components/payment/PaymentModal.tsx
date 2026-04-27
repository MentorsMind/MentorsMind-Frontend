import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Alert from '../ui/Alert';
import type { AssetType, Mentor } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  sessionDuration: number; // minutes
  onSuccess?: (txHash: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, details, onSuccess }) => {
  const {
    state,
    breakdown,
    assets,
    setStep,
    selectAsset,
    enterReview,
    processPayment,
    retry,
    reset,
  } = usePayment(details);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.step !== 'processing') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [state.step, onClose]);

  useEffect(() => {
    if (state.step === 'success' && state.transactionHash && onSuccess) {
      onSuccess(state.transactionHash);
    }
  }, [state.step, state.transactionHash, onSuccess]);

  if (!isOpen) return null;

  const handleBack = () => {
    if (state.step === 'review') setStep('method');
    else if (state.step === 'error') setStep('review');
  };

  const handleClose = () => {
    if (state.step !== 'processing') {
      onClose();
      setTimeout(reset, 300);
    }
  };

  const mockDownloadReceipt = () => {
    const receiptText = `
MENTORSMIND PAYMENT RECEIPT
---------------------------
Date: ${new Date().toLocaleString()}
Mentor: ${details.mentorName}
Topic: ${details.sessionTopic}
Amount: ${breakdown.totalAmount.toFixed(4)} ${breakdown.assetCode}
Status: COMPLETED
Transaction Hash: ${state.transactionHash}
---------------------------
Powered by Stellar Network
    `;
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt_${details.sessionId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
const PLATFORM_FEE = 0.05;
const ASSETS: AssetType[] = ['XLM', 'USDC', 'PYUSD'];

type Step = 'review' | 'processing' | 'success' | 'error';

export default function PaymentModal({ isOpen, onClose, mentor, sessionDuration, onSuccess }: PaymentModalProps) {
  const [asset, setAsset] = useState<AssetType>('XLM');
  const [step, setStep] = useState<Step>('review');
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionPrice = (mentor.hourlyRate * sessionDuration) / 60;
  const platformFee = sessionPrice * PLATFORM_FEE;
  const total = sessionPrice + platformFee;

  const handlePay = async () => {
    if (isSubmitting || step === 'processing') return;
    setIsSubmitting(true);
    setStep('processing');
    // Simulate Stellar transaction
    await new Promise(r => setTimeout(r, 2500));
    const mockHash = 'TX' + Math.random().toString(36).substring(2, 18).toUpperCase();
    setTxHash(mockHash);
    setIsSubmitting(false);
    setStep('success');
    onSuccess?.(mockHash);
  };

  const handleClose = () => { setStep('review'); setIsSubmitting(false); onClose(); };

  const confirmDisabled = state.quoteRefreshing || !state.quote;
  const showSlippageWarning =
    state.step === 'review' &&
    state.quote &&
    state.quote.maxSlippagePct > 0.5;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-stellar/10 border border-gray-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {['review', 'error'].includes(state.step) && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {state.step === 'method'     && 'Select Asset'}
              {state.step === 'review'     && 'Review Payment'}
              {state.step === 'processing' && 'Sign Transaction'}
              {state.step === 'success'    && 'Confirmed'}
              {state.step === 'error'      && 'Retry Payment'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={state.step === 'processing'}
            className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quote countdown + banners (review step only) */}
        {state.step === 'review' && (
          <div className="px-8 space-y-2">
            {/* Countdown timer */}
            {state.quoteSecondsLeft !== undefined && (
              <div
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl ${
                  state.quoteSecondsLeft <= QUOTE_REFRESH_THRESHOLD_DISPLAY
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-gray-50 text-gray-500'
                }`}
                aria-live="polite"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.quoteRefreshing
                  ? 'Refreshing quote…'
                  : `Quote expires in ${state.quoteSecondsLeft}s`}
              </div>
            )}

            {/* Rate-updated banner */}
            {state.rateUpdated && state.quote && state.previousReceiveAmount !== undefined && (
              <div
                className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium px-3 py-2 rounded-xl"
                role="alert"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                </svg>
                Rate updated — you'll now receive{' '}
                <span className="font-bold ml-1">
                  {state.quote.receiveAmount.toFixed(4)} {state.selectedAsset}
                </span>
                &nbsp;(was {state.previousReceiveAmount.toFixed(4)})
              </div>
            )}

            {/* Slippage warning */}
            {showSlippageWarning && (
              <div
                className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium px-3 py-2 rounded-xl"
                role="alert"
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                High slippage warning — max slippage is{' '}
                <span className="font-bold ml-1">{state.quote!.maxSlippagePct.toFixed(2)}%</span>.
                The final amount may differ.
              </div>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="px-8 pb-10">
          <div className="mt-4">
            {state.step === 'method' && (
              <PaymentMethod
                assets={assets}
                selectedAsset={state.selectedAsset}
                onSelect={(asset) => {
                  selectAsset(asset);
                  enterReview(asset);
                }}
              />
            )}

            {state.step === 'review' && (
              <PaymentBreakdown
                breakdown={breakdown}
                mentorName={details.mentorName}
                sessionTopic={details.sessionTopic}
              />
            )}

            {(state.step === 'processing' || state.step === 'success' || state.step === 'error') && (
              <PaymentStatus
                step={state.step}
                error={state.error}
                transactionHash={state.transactionHash}
              />
            )}

            {state.step === 'success' && (
              <PaymentReceipt
                details={details}
                breakdown={breakdown}
                transactionHash={state.transactionHash}
                onDownload={mockDownloadReceipt}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8">
            {state.step === 'review' && (
              <button
                onClick={processPayment}
                disabled={confirmDisabled}
                className="w-full py-4 px-6 bg-stellar text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-stellar/25 hover:bg-stellar-dark hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {state.quoteRefreshing
                  ? 'Refreshing quote…'
                  : `Confirm & Pay ${breakdown.totalAmount.toFixed(4)} ${breakdown.assetCode}`}
              </button>
            )}

            {state.step === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={retry}
                  className="w-full py-4 px-6 bg-stellar text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-stellar/25 hover:bg-stellar-dark transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => setStep('method')}
                  className="w-full py-4 px-6 bg-white text-gray-500 rounded-[1.25rem] font-bold text-sm border-2 border-gray-100 hover:bg-gray-50 transition-all"
                >
                  Change Payment Method
                </button>
              </div>
            )}
    <Modal isOpen={isOpen} onClose={handleClose} title={step === 'review' ? 'Confirm Payment' : undefined} size="md">
      {step === 'review' && (
        <div className="space-y-5">
          {/* Mentor info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {mentor.name[0]}
            </div>
            <div>
              <p className="font-medium text-gray-900">{mentor.name}</p>
              <p className="text-sm text-gray-500">{sessionDuration} min session</p>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Escrow Protected</span>
          </div>

          {/* Asset selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Pay with</p>
            <div className="flex gap-2">
              {ASSETS.map(a => (
                <button key={a} onClick={() => setAsset(a)}
                  className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-colors
                    ${asset === a ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Session fee ({sessionDuration} min)</span>
              <span>{sessionPrice.toFixed(2)} {asset}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Platform fee (5%)</span>
              <span>{platformFee.toFixed(2)} {asset}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{total.toFixed(2)} {asset}</span>
            </div>
          </div>

          <Alert type="info">Funds are held in escrow and released to the mentor after session completion.</Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button onClick={handlePay} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Processing…' : `Pay ${total.toFixed(2)} ${asset}`}
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="animate-spin w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900">Processing on Stellar...</p>
          <p className="text-sm text-gray-500">Submitting transaction to the blockchain</p>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
          <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
          <p className="text-sm text-gray-500">Your session is confirmed and funds are in escrow.</p>
          <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono text-gray-600 break-all">{txHash}</div>
          <Button onClick={handleClose} className="w-full">Done</Button>
        </div>
      )}

      {step === 'error' && (
        <div className="py-8 text-center space-y-4">
          <div className="text-5xl">❌</div>
          <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
          <p className="text-sm text-gray-500">Something went wrong. Please try again.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
            <Button onClick={() => setStep('review')} className="flex-1">Try Again</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

// Kept as a plain constant so the JSX above can reference it without importing from the hook
const QUOTE_REFRESH_THRESHOLD_DISPLAY = 15;

export default PaymentModal;
