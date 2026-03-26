import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';
import type { SessionHistoryItem } from '../../types';
import { SkillTagSelector } from '../mentor/SkillTagSelector';

const SKILL_SUGGESTIONS = [
  'React', 'TypeScript', 'Node.js', 'System Design', 'Stellar', 'Soroban',
  'Python', 'Leadership', 'Career Development', 'DevOps', 'Machine Learning',
];

interface PostSessionReviewProps {
  session: SessionHistoryItem;
  submitted: boolean;
  updatedRating: number | null;
  onSubmit: (data: { rating: number; comment: string; skillTags: string[] }) => Promise<void>;
  onDismiss: () => void;
  onClose: () => void;
}

const PostSessionReview: React.FC<PostSessionReviewProps> = ({
  session,
  submitted,
  updatedRating,
  onSubmit,
  onDismiss,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSubmit({ rating, comment, skillTags });
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-900 shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle className="h-14 w-14 text-emerald-500" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Thank you!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your review has been submitted.
            </p>
            {updatedRating !== null && (
              <div className="flex items-center gap-1 text-yellow-500 text-lg">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5"
                    fill={i < updatedRating ? 'currentColor' : 'none'}
                  />
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {session.mentorName}'s updated rating
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="mt-2 rounded-2xl bg-stellar px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stellar">
                  Session Review
                </p>
                <h2
                  id="review-modal-title"
                  className="mt-1 text-xl font-black text-gray-900 dark:text-white"
                >
                  How was your session?
                </h2>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Remind me later"
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pre-filled context */}
            <div className="mx-6 mt-4 rounded-2xl bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white">{session.mentorName}</p>
              <p className="text-gray-500 dark:text-gray-400">
                {session.topic} · {sessionDate}
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Star rating */}
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900 dark:text-white">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1" role="group" aria-label="Star rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hovered || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {error && <p role="alert" className="mt-1 text-sm text-red-500">{error}</p>}
              </div>

              {/* Written review */}
              <div>
                <label
                  htmlFor="post-review-comment"
                  className="mb-2 block text-sm font-bold text-gray-900 dark:text-white"
                >
                  Written review <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="post-review-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share what you learned or how the session went..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-stellar focus:bg-white dark:focus:bg-gray-700 resize-none"
                />
              </div>

              {/* Skill tags */}
              <SkillTagSelector
                selectedSkills={skillTags}
                onChange={setSkillTags}
                label="Skills you learned (optional)"
                placeholder="Add a skill..."
                suggestions={SKILL_SUGGESTIONS}
              />

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-stellar py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading ? 'Submitting…' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostSessionReview;
