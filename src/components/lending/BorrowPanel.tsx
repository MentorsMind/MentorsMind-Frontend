import React, { useState } from 'react';
import ActiveLoan from './ActiveLoan';
import { ActiveLoan as ActiveLoanType } from '../../hooks/useLendingPool';

interface BorrowPanelProps {
  creditScore: number;
  availableCredit: number;
  activeLoan: ActiveLoanType | null;
  isProcessing: boolean;
  onBorrow: (amount: number, sessionId: string) => void;
  onRepay: () => void;
}

const MOCK_SESSIONS = [
  { id: 'sess-1', title: 'React Performance Tuning with Sarah', price: 150 },
  { id: 'sess-2', title: 'Smart Contract Audit with John', price: 300 },
  { id: 'sess-3', title: 'UI/UX Design Review with Emma', price: 100 },
];

const BorrowPanel: React.FC<BorrowPanelProps> = ({
  creditScore,
  availableCredit,
  activeLoan,
  isProcessing,
  onBorrow,
  onRepay,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');

  const amount = parseFloat(amountStr) || 0;
  const isCreditTooLow = creditScore < 600;
  const isAmountTooHigh = amount > availableCredit;
  const borrowFee = amount * 0.05; // 5% flat fee
  const totalRepayment = amount + borrowFee;

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || isCreditTooLow || isAmountTooHigh || isProcessing || activeLoan || !selectedSessionId) return;
    onBorrow(amount, selectedSessionId);
    setAmountStr('');
    setSelectedSessionId('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <h3 className="text-gray-500 text-sm font-semibold mb-1">Your Credit Score</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold tabular-nums ${isCreditTooLow ? 'text-red-500' : 'text-emerald-500'}`}>
              {creditScore}
            </span>
            <span className="text-xs text-gray-400 font-medium bg-gray-200 px-2 py-0.5 rounded-full">
              {isCreditTooLow ? 'Poor' : 'Good'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-gray-500 text-sm font-semibold mb-1">Available Credit</h3>
          <span className="text-2xl font-bold text-gray-900 tabular-nums">
            ${availableCredit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {activeLoan && (
        <ActiveLoan loan={activeLoan} onRepay={onRepay} isProcessing={isProcessing} />
      )}

      <form onSubmit={handleBorrow} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <label htmlFor="session-select" className="block text-sm font-semibold text-gray-700 mb-2">
            Select Mentor Session
          </label>
          <select
            id="session-select"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-stellar focus:ring-2 focus:ring-stellar/20 text-gray-700 font-medium transition-all"
            disabled={isProcessing || !!activeLoan}
            required
          >
            <option value="" disabled>Choose a session to borrow for...</option>
            {MOCK_SESSIONS.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - ${session.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="borrow-amount" className="block text-sm font-semibold text-gray-700 mb-2">
            Borrow Amount (USDC)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-medium">$</span>
            </div>
            <input
              type="number"
              id="borrow-amount"
              min="1"
              max={availableCredit}
              step="any"
              required
              disabled={isProcessing || !!activeLoan}
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-stellar focus:ring-2 focus:ring-stellar/20 text-gray-900 font-bold tabular-nums transition-all"
              placeholder="0.00"
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500 font-medium">
            <span>Min: $10</span>
            <span className={isAmountTooHigh ? 'text-red-500' : ''}>Max: ${availableCredit}</span>
          </div>
        </div>

        {amount > 0 && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Principal Amount</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-600">
              <span>Platform Fee (5%)</span>
              <span>${borrowFee.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900">
              <span>Total Repayment Due (14 Days)</span>
              <span>${totalRepayment.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="relative group">
          <button
            type="submit"
            disabled={
              isProcessing || 
              isCreditTooLow || 
              !!activeLoan || 
              amount <= 0 || 
              isAmountTooHigh || 
              !selectedSessionId
            }
            className="w-full px-6 py-4 bg-stellar hover:bg-stellar-dark text-white font-bold rounded-xl shadow-md transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Processing Request...' : 'Request Loan'}
          </button>
          
          {/* Tooltip for low credit score */}
          {isCreditTooLow && (
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block w-64 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg text-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              Your credit score is below the minimum requirement of 600. Build your credit by participating more on the platform.
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default BorrowPanel;
