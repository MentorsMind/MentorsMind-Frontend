import React from 'react';

interface AMLNoticeProps {
  amountUsd: number;
  threshold?: number;
}

const AMLNotice: React.FC<AMLNoticeProps> = ({
  amountUsd,
  threshold = 10_000,
}) => {
  if (amountUsd <= threshold) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">
        This transaction will be reported as required by law.
      </p>
      <p className="mt-1 text-xs text-amber-700">
        Threshold triggered at ${threshold.toLocaleString()}+. Current amount: ${amountUsd.toLocaleString()}.
      </p>
    </div>
  );
};

export default AMLNotice;
