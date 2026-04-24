import type { Session } from '../../types';
import Badge from '../ui/Badge';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning', confirmed: 'default', completed: 'success', cancelled: 'danger', rescheduled: 'warning',
};

interface SessionListProps { sessions?: Session[]; }

const MOCK: Session[] = [
  { id: '1', mentorId: 'm1', learnerId: 'l1', scheduledAt: new Date(Date.now() + 86400000).toISOString(), duration: 60, status: 'confirmed', price: 90, asset: 'USDC' },
  { id: '2', mentorId: 'm1', learnerId: 'l2', scheduledAt: new Date(Date.now() - 86400000).toISOString(), duration: 30, status: 'completed', price: 45, asset: 'XLM' },
];

export default function SessionList({ sessions = MOCK }: SessionListProps) {
  return (
    <div className="space-y-3">
      {sessions.map(s => (
        <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{new Date(s.scheduledAt).toLocaleString()}</p>
            <p className="text-xs text-gray-500">{s.duration} min · {s.price} {s.asset}</p>
          </div>
          <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
        </div>
      ))}
    </div>
  );
}
