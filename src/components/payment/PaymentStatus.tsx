import React from 'react';
import type { PaymentStep } from '../../types/payment.types';

interface PaymentStatusProps {
  step: PaymentStep;
  error?: string;
  transactionHash?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ step, error, transactionHash }) => {
  if (step === 'processing') {
    return (
      <div className="py-10 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-stellar/20 animate-pulse" />
          <div className="w-20 h-20 rounded-full border-t-4 border-stellar animate-spin absolute inset-0" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Processing Payment</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-[240px] mx-auto">
            Please wait while we secure your session through the Stellar network...
          </p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-500 text-4xl animate-in zoom-in duration-500">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Payment Successful</h3>
          <p className="text-sm text-gray-500 mt-1">Your session has been confirmed and secured.</p>
        </div>
        
        {transactionHash && (
          <div className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 text-left px-1">Stellar TX Hash</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[10px] text-gray-600 font-mono break-all text-left bg-white p-2 rounded border border-gray-200 leading-relaxed">
                {transactionHash}
              </code>
              <a 
                href={`https://stellar.expert/explorer/testnet/tx/${transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 text-stellar hover:bg-stellar/5 rounded-lg transition-colors"
                title="View on Stellar Expert"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-4xl">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Payment Failed</h3>
          <p className="text-sm text-red-500 mt-1 font-medium">{error || 'Something went wrong.'}</p>
        </div>
        <p className="text-xs text-gray-400 max-w-[280px]">
          There was an issue processing your transaction. This could be due to network congestion or insufficient funds.
        </p>
      </div>
    );
  }

  return null;
};

export default PaymentStatus;
