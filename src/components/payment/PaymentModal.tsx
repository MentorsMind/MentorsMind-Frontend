import React, { useEffect } from 'react';
import { usePayment } from '../../hooks/usePayment';
import type { PaymentDetails } from '../../types/payment.types';
import PaymentMethod from './PaymentMethod';
import PaymentBreakdown from './PaymentBreakdown';
import PaymentReceipt from './PaymentReceipt';
import TransactionTracker from './TransactionTracker';
import AMLNotice from '../compliance/AMLNotice';
import { useStellarTransaction } from '../../hooks/useStellarTransaction';

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
    connectWallet,
    reset
  } = usePayment(details);

  const {
    step: txStep,
    txHash,
    error: txError,
    ledgerCloseCountdown,
    escrowAddress,
    submitTransaction,
    reset: resetTx
  } = useStellarTransaction();

  // Sync state between usePayment and useStellarTransaction
  const currentStep = txStep !== 'idle' ? (txStep === 'submitting' || txStep === 'pending' ? 'processing' : txStep) : state.step;

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'processing') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [currentStep, onClose]);

  // Handle success callback
  useEffect(() => {
    if (txStep === 'confirmed' && txHash && onSuccess) {
      onSuccess(txHash);
    }
  }, [txStep, txHash, onSuccess]);

  if (!isOpen) return null;

  const handleBack = () => {
    if (state.step === 'review') setStep('method');
    else if (currentStep === 'error') {
        resetTx();
        setStep('review');
    }
  };

  const handleClose = () => {
    if (currentStep !== 'processing') {
      onClose();
      // Optional: reset after fade out
      setTimeout(() => {
          reset();
          resetTx();
      }, 300);
    }
  };

  const handleProcessPayment = async () => {
    await submitTransaction(async () => {
      // Logic for actual transaction would go here
      // For now we simulate the result expected by TransactionTracker
      const mockHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      const mockEscrow = state.selectedAsset !== 'XLM' 
        ? 'G' + Math.random().toString(36).substring(2, 58).toUpperCase() 
        : undefined;

      // Simulate network interaction
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return { hash: mockHash, escrow: mockEscrow };
    });
  };

  const handleRetry = () => {
    resetTx();
    handleProcessPayment();
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
              {state.step === 'connect' && 'Connect Wallet'}
              {state.step === 'method' && 'Select Asset'}
              {state.step === 'review' && 'Review Payment'}
              {currentStep === 'processing' && 'Sign Transaction'}
              {currentStep === 'success' && 'Confirmed'}
              {currentStep === 'error' && 'Retry Payment'}
            </h2>
          </div>
          <button 
            onClick={handleClose}
            disabled={currentStep === 'processing'}
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
            {state.step === 'connect' && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-stellar rounded-2xl mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Connect Your Wallet</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Connect your Freighter wallet to securely sign and send Stellar transactions for this payment.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Secure & Private</p>
                      <p className="text-xs text-blue-700">Your keys never leave your device</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Fast Transactions</p>
                      <p className="text-xs text-green-700">Stellar network confirms in seconds</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
              <div className="space-y-4">
                <PaymentBreakdown 
                  breakdown={breakdown}
                  mentorName={details.mentorName}
                  sessionTopic={details.sessionTopic}
                />
                <AMLNotice amountUsd={details.amount} />
              </div>
            )}

            {(currentStep === 'processing' || currentStep === 'success' || currentStep === 'error') && (
              <TransactionTracker 
                step={txStep}
                error={txError}
                txHash={txHash}
                ledgerCloseCountdown={ledgerCloseCountdown}
                escrowAddress={escrowAddress}
                breakdown={breakdown}
                priceInUSD={assets.find(a => a.code === state.selectedAsset)?.priceInUSD || 1}
              />
            )}

            {currentStep === 'success' && (
              <PaymentReceipt 
                details={details}
                breakdown={breakdown}
                transactionHash={txHash}
                onDownload={mockDownloadReceipt}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="mt-8">
            {state.step === 'connect' && (
              <button
                onClick={connectWallet}
                className="w-full py-4 px-6 bg-stellar text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-stellar/25 hover:bg-stellar-dark hover:scale-[1.01] active:scale-95 transition-all"
              >
                Connect Freighter Wallet
              </button>
            )}

            {state.step === 'review' && (
              <button
                onClick={handleProcessPayment}
                className="w-full py-4 px-6 bg-stellar text-white rounded-[1.25rem] font-black text-base shadow-xl shadow-stellar/25 hover:bg-stellar-dark hover:scale-[1.01] active:scale-95 transition-all"
              >
                Confirm & Pay {breakdown.totalAmount.toFixed(4)} {breakdown.assetCode}
              </button>
            )}

            {currentStep === 'error' && (
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
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

            {state.step === 'connect' && (
              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6">
                Requires Freighter Wallet Extension
              </p>
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
