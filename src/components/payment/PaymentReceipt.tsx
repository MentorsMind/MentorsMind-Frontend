import React from 'react';
import type { PaymentBreakdown, PaymentDetails } from '../../types/payment.types';

interface PaymentReceiptProps {
  details: PaymentDetails;
  breakdown: PaymentBreakdown;
  transactionHash?: string;
  onDownload: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  details, 
  breakdown, 
  transactionHash,
  onDownload 
}) => {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 relative overflow-hidden">
        {/* Receipt Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-stellar rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-stellar/20 mb-3">
            M
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-widest">Payment Receipt</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">MentorsMind Stellar Network</p>
        </div>

        {/* Receipt Content */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Session With</p>
              <p className="font-bold text-gray-900">{details.mentorName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date</p>
              <p className="text-xs font-semibold text-gray-700">{date}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Topic</p>
            <p className="text-xs font-medium text-gray-600 italic line-clamp-1">"{details.sessionTopic}"</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Mentor Fee</span>
              <span>{breakdown.baseAmount.toFixed(4)} {breakdown.assetCode}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Network Fee</span>
              <span>{breakdown.platformFee.toFixed(4)} {breakdown.assetCode}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900">Total Paid</span>
              <span className="text-lg font-black text-stellar">{breakdown.totalAmount.toFixed(4)} {breakdown.assetCode}</span>
            </div>
          </div>

          {transactionHash && (
            <div className="pt-2">
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Transaction Verified on Stellar</p>
              <p className="text-[9px] font-mono text-gray-400 break-all bg-gray-50 p-2 rounded border border-gray-100">
                {transactionHash}
              </p>
            </div>
          )}
        </div>

        {/* Decorative Circles for "Perforated" look */}
        <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border border-gray-200 rounded-full" />
        <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full" />
      </div>

      <button
        onClick={onDownload}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-[0.98] group"
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Receipt (PDF)
      </button>
    </div>
  );
};

export default PaymentReceipt;
