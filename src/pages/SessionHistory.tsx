import type { Session } from '../types';
import Badge from '../components/ui/Badge';
import NoteEditor from '../components/learner/NoteEditor';
import { useState, useEffect } from 'react';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { useMinimumLoading } from '../hooks/useMinimumLoading';

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning', confirmed: 'default', completed: 'success', cancelled: 'danger', rescheduled: 'warning',
};

const MOCK: Session[] = [
  { id: '1', mentorId: 'm1', learnerId: 'l1', scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(), duration: 60, status: 'completed', price: 90, asset: 'USDC', notes: '' },
  { id: '2', mentorId: 'm2', learnerId: 'l1', scheduledAt: new Date(Date.now() - 86400000 * 7).toISOString(), duration: 30, status: 'completed', price: 45, asset: 'XLM', notes: '' },
];

export default function SessionHistory() {
  const [activeNotes, setActiveNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = useMinimumLoading(isLoading, 300);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
      <div className="space-y-3">
        {showSkeleton ? (
          <>
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} variant="booking" />)}
          </>
        ) : MOCK.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{new Date(s.scheduledAt).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">{s.duration} min · {s.price} {s.asset}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                <Link
                  to={`/sessions/${s.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Details
                </Link>
                <button onClick={() => setActiveNotes(activeNotes === s.id ? null : s.id)}
                  className="text-xs text-indigo-600 hover:underline">Notes</button>
              </div>
            </div>
            {activeNotes === s.id && <NoteEditor sessionId={s.id} />}
          </div>
        ))}
      </div>
    </div>
  );
}
