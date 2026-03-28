import React from 'react';
import { ActiveLoan as ActiveLoanType } from '../../hooks/useLendingPool';

interface ActiveLoanProps {
  loan: ActiveLoanType;
  onRepay: () => void;
  isProcessing?: boolean;
}

const ActiveLoan: React.FC<ActiveLoanProps> = ({ loan, onRepay, isProcessing }) => {
  const isPastDue = new Date(loan.dueDate) < new Date();

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h3 className="text-amber-800 font-bold text-lg mb-1 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Active Loan
        </h3>
        <p className="text-amber-700 font-medium">
          You owe <span className="font-bold">${loan.amount.toFixed(2)}</span> USDC
        </p>
        <p className={`text-sm mt-1 ${isPastDue ? 'text-red-600 font-bold' : 'text-amber-600'}`}>
          Due By: {new Date(loan.dueDate).toLocaleDateString()}
        </p>
      </div>
      <div>
        <button
          onClick={onRepay}
          disabled={isProcessing}
          className="w-full md:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Repay Loan'
          )}
        </button>
      </div>
    </div>
  );
};

export default ActiveLoan;
