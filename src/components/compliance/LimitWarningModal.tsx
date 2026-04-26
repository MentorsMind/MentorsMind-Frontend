import React from 'react';
import FocusTrap from '../a11y/FocusTrap';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LimitWarningModalProps {
  isOpen: boolean;
  amount: number;
  remaining: number;
  kycUrl: string;
  onClose: () => void;
}

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const LimitWarningModal: React.FC<LimitWarningModalProps> = ({
  isOpen,
  amount,
  remaining,
  kycUrl,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <FocusTrap active>
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl mx-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Daily limit exceeded</h3>
            <p className="mt-1 text-sm text-gray-600">
              You tried to withdraw ${formatCurrency(amount)}, but only ${formatCurrency(remaining)} is available today.
              Adjust the amount or complete KYC to increase your limits.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Adjust amount
          </button>
          <Link
            to={kycUrl}
            className="flex-1 rounded-xl bg-stellar px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-stellar/20 hover:bg-stellar-dark"
          >
            Increase limits
          </Link>
        </div>
        </div>
      </FocusTrap>
    </div>
  );
};

export default LimitWarningModal;
