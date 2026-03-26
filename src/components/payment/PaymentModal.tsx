import React, { useEffect } from 'react';
import { usePayment } from '../../hooks/usePayment';
import type { PaymentDetails } from '../../types/payment.types';
import PaymentMethod from './PaymentMethod';
import PaymentBreakdown from './PaymentBreakdown';
import PaymentStatus from './PaymentStatus';
import PaymentReceipt from './PaymentReceipt';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: PaymentDetails;
  onSuccess?: (txHash: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, details, onSuccess }) => {
  const {
    state,
    breakdown,
    assets,
    setStep,
    selectAsset,
    processPayment,
    retry,
    reset
  } = usePayment(details);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.step !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [state.step, onClose]);

  // Handle success callback
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
      // Optional: reset after fade out
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
              {state.step === 'method' && 'Select Asset'}
              {state.step === 'review' && 'Review Payment'}
              {state.step === 'processing' && 'Sign Transaction'}
              {state.step === 'success' && 'Confirmed'}
              {state.step === 'error' && 'Retry Payment'}
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

        {/* Content Body */}
        <div className="px-8 pb-10">
          <div className="mt-4">
            {state.step === 'method' && (
              <PaymentMethod 
                assets={assets}
                selectedAsset={state.selectedAsset}
                onSelect={(asset) => {
                  selectAsset(asset);
                  setStep('review');
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
                className="w-full py-4 px-6 bg-stellar text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-stellar/25 hover:bg-stellar-dark hover:scale-[1.01] active:scale-95 transition-all"
              >
                Confirm & Pay {breakdown.totalAmount.toFixed(4)} {breakdown.assetCode}
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

            {state.step === 'success' && (
              <button
                onClick={handleClose}
                className="w-full py-4 px-6 bg-gray-50 text-gray-900 rounded-[1.25rem] font-black text-base hover:bg-gray-100 transition-all"
              >
                Done
              </button>
            )}

            {state.step === 'method' && (
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                Requires a Stellar Compatible Wallet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
