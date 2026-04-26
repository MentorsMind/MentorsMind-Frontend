import type { Review } from '../../types';

const MOCK: Review[] = [
  { id: '1', sessionId: 's1', mentorId: 'm1', learnerId: 'l1', rating: 5, comment: 'Excellent session! Very clear explanations.', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: '2', sessionId: 's2', mentorId: 'm1', learnerId: 'l2', rating: 4, comment: 'Great mentor, very knowledgeable.', createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
];

interface ReviewListProps { reviews?: Review[]; }

export default function ReviewList({ reviews = MOCK }: ReviewListProps) {
  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
              ))}
            </div>
            <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-gray-700">{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
