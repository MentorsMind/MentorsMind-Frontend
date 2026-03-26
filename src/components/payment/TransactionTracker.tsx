import React from 'react';
import type { PaymentBreakdown } from '../../types/payment.types';
import type { TransactionStep } from '../../hooks/useStellarTransaction';
import { 
  formatCryptoAmount, 
  convertToUSD, 
  getStellarExpertLink, 
  getAccountLink 
} from '../../utils/stellar.utils';

interface TransactionTrackerProps {
  step: TransactionStep;
  txHash?: string;
  error?: string;
  errorCode?: string;
  ledgerCloseCountdown: number;
  escrowAddress?: string;
  breakdown: PaymentBreakdown;
  priceInUSD: number;
}

const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  step,
  txHash,
  error,
  ledgerCloseCountdown,
  escrowAddress,
  breakdown,
  priceInUSD
}) => {
  const steps = [
    { id: 'submitting', label: 'Submitted', icon: '📝' },
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'confirmed', label: 'Confirmed', icon: '✅' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === (step === 'error' ? 'submitting' : step));
  
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Amount Display */}
      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount to Pay</p>
          <p className="text-xl font-black text-gray-900">
            {formatCryptoAmount(breakdown.totalAmount)} {breakdown.assetCode}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">USD Equivalent</p>
          <p className="text-lg font-bold text-stellar">
            {convertToUSD(breakdown.totalAmount, priceInUSD)}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="relative flex justify-between px-2">
        {/* Connection Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-100 -z-10">
          <div 
            className="h-full bg-stellar transition-all duration-500" 
            style={{ width: `${Math.max(0, currentStepIndex) * 50}%` }}
          />
        </div>

        {steps.map((s, index) => {
          const isCompleted = currentStepIndex > index || step === 'confirmed';
          const isActive = step === s.id;
          
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 group">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300
                ${isCompleted ? 'bg-stellar text-white' : isActive ? 'bg-white border-2 border-stellar text-stellar shadow-lg shadow-stellar/20 scale-110' : 'bg-white border-2 border-gray-100 text-gray-300'}
              `}>
                {isCompleted ? '✓' : s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-stellar' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Status Content */}
      <div className="min-h-[80px] flex flex-col items-center justify-center text-center p-4">
        {step === 'submitting' && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Signing and submitting to Stellar network...</p>
            <div className="flex gap-1 justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-stellar rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {step === 'pending' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-600">Waiting for ledger confirmation...</p>
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-stellar/5 rounded-full border border-stellar/10">
              <span className="text-xl font-black text-stellar tabular-nums">{ledgerCloseCountdown}s</span>
              <span className="text-[10px] font-bold text-stellar/60 uppercase tracking-tighter">Avg Close Time</span>
            </div>
          </div>
        )}

        {step === 'confirmed' && (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-2xl border border-green-100 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-lg font-bold">✓</div>
              <div className="text-left">
                <p className="font-black text-sm">Transaction Confirmed</p>
                <p className="text-xs opacity-80">Included in the latest Stellar ledger</p>
              </div>
            </div>
            
            {txHash && (
              <a 
                href={getStellarExpertLink(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-stellar/20 hover:text-stellar transition-all shadow-sm group"
              >
                View on Stellar Expert
                <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div className="text-left">
                <p className="text-sm font-black text-red-900">Payment Failed</p>
                <p className="text-xs text-red-600/80 leading-relaxed">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Escrow Info */}
      {escrowAddress && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-amber-900/40 uppercase tracking-widest">Escrow Contract Created</p>
                <a 
                    href={getAccountLink(escrowAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black text-amber-600 hover:text-amber-700 underline underline-offset-2"
                >
                    Verify Contract
                </a>
            </div>
            <code className="text-xs font-mono text-amber-900 bg-white/50 p-2 rounded-lg break-all border border-amber-200/50">
                {escrowAddress}
            </code>
        </div>
      )}
    </div>
  );
};

export default TransactionTracker;
