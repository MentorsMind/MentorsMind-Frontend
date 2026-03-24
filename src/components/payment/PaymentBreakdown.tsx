import React from 'react';
import type { PaymentBreakdown as BreakdownType } from '../../types/payment.types';

interface PaymentBreakdownProps {
  breakdown: BreakdownType;
  mentorName: string;
  sessionTopic: string;
}

const PaymentBreakdown: React.FC<PaymentBreakdownProps> = ({ breakdown, mentorName, sessionTopic }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-stellar/10 border border-stellar/20 flex items-center justify-center text-stellar font-bold text-lg">
            {mentorName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{mentorName}</h4>
            <p className="text-xs text-gray-500 font-medium line-clamp-1">{sessionTopic}</p>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-200/60">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Mentor Fee</span>
            <span className="text-gray-900 font-semibold">{breakdown.baseAmount.toFixed(4)} {breakdown.assetCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 font-medium">Platform Fee (5%)</span>
            <span className="text-gray-900 font-semibold">{breakdown.platformFee.toFixed(4)} {breakdown.assetCode}</span>
          </div>
          <div className="pt-3 border-t border-gray-200/60 flex justify-between items-end">
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total to Pay</span>
              <span className="text-xl font-black text-stellar leading-none">{breakdown.totalAmount.toFixed(4)} {breakdown.assetCode}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stellar Asset</span>
              <span className="text-xs font-bold text-gray-700">{breakdown.assetCode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-1 space-y-3">
        <div className="flex gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            <span className="font-bold text-gray-700">Non-custodial:</span> Tokens stay in your wallet until you sign the transaction.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-[11px] text-gray-500 leading-tight">
            <span className="font-bold text-gray-700">Atomic Settlement:</span> Payment is atomically settled on the Stellar network.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
