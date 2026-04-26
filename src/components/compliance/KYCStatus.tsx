import React from 'react';
import { KYCStatus as KYCStatusType, KYCLimits } from '../../hooks/useKYC';

interface KYCStatusBannerProps {
  status: KYCStatusType;
  limits: KYCLimits;
  onVerify: () => void;
  onResubmit?: () => void;
  rejectionReason?: string | null;
}

export const KYCStatusBanner: React.FC<KYCStatusBannerProps> = ({
  status,
  limits,
  onVerify,
  onResubmit,
  rejectionReason,
}) => {
  const getBannerStyle = () => {
    switch (status) {
      case 'unverified':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'pending':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'basic':
      case 'enhanced':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'unverified':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'rejected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'basic':
      case 'enhanced':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={`p-4 rounded-2xl border ${getBannerStyle()} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon()}</div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider">
            KYC Status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </h4>
          <p className="text-sm mt-1 opacity-90">
            {status === 'unverified' && 'Verify your identity to unlock higher transaction limits and borrowing capacity.'}
            {status === 'pending' && 'Your documents are being reviewed. This usually takes 24-48 hours.'}
            {status === 'rejected' && `Verification failed: ${rejectionReason || 'Unknown reason'}. Please check your info and resubmit.`}
            {(status === 'basic' || status === 'enhanced') && 'Identity verified. You have unlocked higher limits.'}
          </p>
          <div className="mt-2 flex items-center gap-4 text-xs font-medium">
            <span>Current Limit: <span className="font-bold">${limits.current.toLocaleString()}</span></span>
            {status !== 'enhanced' && (
              <span>Max Potential: <span className="font-bold text-stellar">${limits.potential.toLocaleString()}</span></span>
            )}
          </div>
        </div>
      </div>
      
      {(status === 'unverified' || status === 'rejected') && (
        <button
          onClick={status === 'rejected' ? onResubmit : onVerify}
          className="whitespace-nowrap px-6 py-2 bg-white text-gray-900 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          {status === 'rejected' ? 'Resubmit Verification' : 'Verify Now'}
        </button>
      )}
    </div>
  );
};
