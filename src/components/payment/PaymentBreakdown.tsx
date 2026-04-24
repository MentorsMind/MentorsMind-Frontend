import type { AssetType } from '../../types';

interface PaymentBreakdownProps {
  sessionFee: number;
  platformFeePercent?: number;
  asset: AssetType;
}

export default function PaymentBreakdown({ sessionFee, platformFeePercent = 5, asset }: PaymentBreakdownProps) {
  const fee = sessionFee * (platformFeePercent / 100);
  const total = sessionFee + fee;
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Session fee</span><span>{sessionFee.toFixed(2)} {asset}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Platform fee ({platformFeePercent}%)</span><span>{fee.toFixed(2)} {asset}</span>
      </div>
      <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100">
        <span>Total</span><span>{total.toFixed(2)} {asset}</span>
      </div>
    </div>
  );
}
