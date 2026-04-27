import React, { useState, useEffect } from 'react';
import type { EscrowContract, EscrowStatus } from '../../types/payment.types';

const disputeStatusLabelMap: Record<string, string> = {
  open: 'Under Review',
  under_review: 'Escalated',
  resolved: 'Resolved',
};

const getDisputeStatusLabel = (status: string): string => {
  return disputeStatusLabelMap[status] ?? status;
};

interface EscrowStatusProps {
  escrow: EscrowContract;
  userRole: 'learner' | 'mentor';
  onRelease?: () => void;
  onDispute?: () => void;
  getCountdown: (autoReleaseAt: string) => string;
  canRelease: boolean;
  canDispute: boolean;
  isWithinDisputeWindow: boolean;
  loading?: boolean;
}

const statusConfig: Record<EscrowStatus, { label: string; color: string; icon: string; bgColor: string }> = {
  active: {
    label: 'Active',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: '🔒'
  },
  released: {
    label: 'Released',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: '✅'
  },
  disputed: {
    label: 'Disputed',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    icon: '⚠️'
  },
  refunded: {
    label: 'Refunded',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 border-gray-200',
    icon: '↩️'
  }
};

const EscrowStatus: React.FC<EscrowStatusProps> = ({
  escrow,
  userRole,
  onRelease,
  onDispute,
  getCountdown,
  canRelease,
  canDispute,
  isWithinDisputeWindow,
  loading = false
}) => {
  const [countdown, setCountdown] = useState('');
  const config = statusConfig[escrow.status];

  useEffect(() => {
    if (escrow.status !== 'active') return;

    const updateCountdown = () => {
      setCountdown(getCountdown(escrow.autoReleaseAt));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [escrow.status, escrow.autoReleaseAt, getCountdown]);

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b ${config.bgColor} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
            <p className="text-xs text-gray-500">Escrow Contract</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gray-900">
            {escrow.amount} {escrow.asset}
          </p>
          <p className="text-xs text-gray-400">Locked Amount</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Contract Address
          </label>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <code className="flex-1 text-xs font-mono text-gray-600 break-all">
              {formatAddress(escrow.contractAddress)}
            </code>
            <a
              href={escrow.stellarExpertUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stellar hover:bg-stellar/10 rounded-lg transition-colors flex-shrink-0"
              title="View on Stellar Expert"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Session Date
            </label>
            <p className="text-sm font-medium text-gray-700">{formatDate(escrow.sessionDate)}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Created
            </label>
            <p className="text-sm font-medium text-gray-700">{formatDate(escrow.createdAt)}</p>
          </div>
        </div>

        {escrow.status === 'active' && (
          <div className="bg-stellar/5 rounded-xl p-4 border border-stellar/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-stellar/60 uppercase tracking-widest">
                  Auto-Release Countdown
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Funds will be released automatically if no dispute is filed
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-stellar tabular-nums">
                  {countdown || '--:--:--'}
                </p>
                <p className="text-[10px] text-gray-400">HH:MM:SS</p>
              </div>
            </div>
          </div>
        )}

        {escrow.status === 'released' && escrow.releasedAt && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">
              Released On
            </p>
            <p className="text-sm font-medium text-green-700 mt-1">
              {formatDate(escrow.releasedAt)}
            </p>
          </div>
        )}

        {escrow.dispute && (
          <div className={`rounded-xl p-4 border ${escrow.dispute.status === 'resolved' ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${escrow.dispute.status === 'resolved' ? 'text-gray-500' : 'text-red-600'}`}>
                Dispute Details
              </p>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${escrow.dispute.status === 'resolved' ? 'bg-gray-200 text-gray-600' : 'bg-red-200 text-red-700'}`}>
                {getDisputeStatusLabel(escrow.dispute.status)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 capitalize">
              Reason: {escrow.dispute.reason.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-gray-500 mt-1">{escrow.dispute.description}</p>
            
            {escrow.dispute.resolution && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Resolution
                </p>
                <p className="text-sm font-medium text-gray-700 capitalize">
                  Outcome: {escrow.dispute.resolution.outcome.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{escrow.dispute.resolution.notes}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          {userRole === 'mentor' && canRelease && (
            <button
              onClick={onRelease}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Release Escrow
                </>
              )}
            </button>
          )}

          {userRole === 'learner' && canDispute && (
            <button
              onClick={onDispute}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  File Dispute
                </>
              )}
            </button>
          )}
        </div>

        {userRole === 'learner' && escrow.status === 'active' && !canDispute && !isWithinDisputeWindow && (
          <p className="text-xs text-gray-400 text-center">
            Dispute window has closed. Funds will be auto-released to the mentor.
          </p>
        )}
      </div>
    </div>
  );
};

export default EscrowStatus;
