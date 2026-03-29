import React from 'react';

interface SanctionsErrorProps {
  walletAddress?: string;
  supportHref?: string;
}

const SanctionsError: React.FC<SanctionsErrorProps> = ({
  walletAddress,
  supportHref = 'mailto:support@mentorsmind.app',
}) => {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4" role="alert">
      <p className="text-sm font-bold text-red-700">This wallet address cannot be used on our platform.</p>
      {walletAddress && (
        <p className="mt-1 text-xs text-red-600">
          Flagged address: <span className="font-semibold">{walletAddress}</span>
        </p>
      )}
      <a href={supportHref} className="mt-3 inline-flex text-sm font-semibold text-red-700 underline underline-offset-2">
        Contact support
      </a>
    </div>
  );
};

export default SanctionsError;
