import { useState } from 'react';
import Button from '../ui/Button';

interface ReviewFormProps {
  sessionId: string;
  mentorName: string;
  onSubmit?: (rating: number, comment: string) => void;
}

export default function ReviewForm({ mentorName, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    onSubmit?.(rating, comment);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="text-center py-6 space-y-2">
      <div className="text-4xl">🌟</div>
      <p className="font-semibold text-gray-900">Review submitted!</p>
      <p className="text-sm text-gray-500">Thanks for your feedback.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-medium text-gray-700">Rate your session with {mentorName}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
            className={`text-3xl transition-transform hover:scale-110 ${s <= (hover || rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
        ))}
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Share your experience..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      <Button type="submit" disabled={!rating} className="w-full">Submit Review</Button>
    </form>
  );
}
