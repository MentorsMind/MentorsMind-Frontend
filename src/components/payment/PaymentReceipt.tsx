import type { Payment } from '../../types';
import PaymentStatus from './PaymentStatus';
import Button from '../ui/Button';

interface PaymentReceiptProps {
  payment: Payment;
  mentorName?: string;
  onClose?: () => void;
}

export default function PaymentReceipt({ payment, mentorName, onClose }: PaymentReceiptProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-sm mx-auto">
      <div className="text-center space-y-2">
        <div className="text-4xl">🧾</div>
        <h3 className="font-bold text-gray-900">Payment Receipt</h3>
        <PaymentStatus status={payment.status} />
      </div>
      <div className="space-y-2 text-sm border-t border-gray-100 pt-4">
        {mentorName && <Row label="Mentor" value={mentorName} />}
        <Row label="Amount" value={`${payment.amount} ${payment.asset}`} />
        <Row label="Date" value={new Date(payment.createdAt).toLocaleDateString()} />
        {payment.stellarTxHash && (
          <div>
            <p className="text-gray-500 text-xs mb-1">Transaction Hash</p>
            <p className="font-mono text-xs text-gray-700 break-all bg-gray-50 p-2 rounded">{payment.stellarTxHash}</p>
          </div>
        )}
      </div>
      {onClose && <Button variant="outline" onClick={onClose} className="w-full">Close</Button>}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
