import type { PaymentStatus as Status } from '../../types';

const CONFIG: Record<Status, { label: string; color: string; icon: string }> = {
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',    icon: '🔄' },
  completed:  { label: 'Completed',  color: 'bg-green-100 text-green-700',  icon: '✅' },
  failed:     { label: 'Failed',     color: 'bg-red-100 text-red-700',      icon: '❌' },
  refunded:   { label: 'Refunded',   color: 'bg-gray-100 text-gray-700',    icon: '↩️' },
};

export default function PaymentStatus({ status }: { status: Status }) {
  const { label, color, icon } = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      <span>{icon}</span>{label}
    </span>
  );
}
