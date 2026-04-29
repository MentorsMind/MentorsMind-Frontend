import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Pencil, Star } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import type { Review } from '../../types';

const HOURS_48 = 48 * 60 * 60 * 1000;
const STAR_LABELS: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };
const PER_PAGE = 5;

interface ReviewsListProps {
  reviews?: Review[];
  currentUserId?: string;
  onVoteHelpful?: (id: string) => void;
  onEdit?: (id: string, data: { rating: number; comment: string }) => void;
}

export default function ReviewsList({
  reviews = [],
  currentUserId,
  onVoteHelpful,
  onEdit,
}: ReviewsListProps) {
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHovered, setEditHovered] = useState(0);
  const [editComment, setEditComment] = useState('');

  const canEdit = (review: Review) => {
    if (!currentUserId || review.reviewerId !== currentUserId) return false;
    return Date.now() - new Date(review.createdAt).getTime() < HOURS_48;
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRating(0);
    setEditComment('');
  };

  const submitEdit = (id: string) => {
    onEdit?.(id, { rating: editRating, comment: editComment });
    cancelEdit();
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Reviews</h2>
        <EmptyState
          variant="card"
          icon={<Star className="w-10 h-10 text-yellow-400" />}
          title="No reviews yet"
          description="This mentor hasn't received any feedback yet. Book a session to be their first reviewer!"
        />
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const slice = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Reviews</h2>

      <div className="divide-y divide-gray-100">
        {slice.map((review) => (
          <div key={review.id} className="py-5">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-stellar/10 flex items-center justify-center text-stellar font-bold text-sm uppercase">
                  {review.reviewerName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{review.reviewerName}</span>
                    {review.isVerified && (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </span>
                {canEdit(review) && (
                  <button
                    onClick={() => startEdit(review)}
                    className="flex items-center gap-1 text-xs font-semibold text-stellar hover:underline"
                    title="Edit your review (within 48h)"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === review.id ? (
              <div className="mb-3 rounded-2xl border border-stellar/20 bg-stellar/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} stars — ${STAR_LABELS[star]}`}
                      onClick={() => setEditRating(star)}
                      onMouseEnter={() => setEditHovered(star)}
                      onMouseLeave={() => setEditHovered(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-6 h-6 ${star <= (editHovered || editRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  {(editHovered || editRating) > 0 && (
                    <span className="text-xs font-semibold text-yellow-600">{STAR_LABELS[editHovered || editRating]}</span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={500}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-stellar resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitEdit(review.id)}
                    disabled={editRating === 0}
                    className="rounded-xl bg-stellar px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-gray-200 px-4 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-3">{review.comment}</p>
            )}

            {/* Helpful votes */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Helpful?</span>
              <button
                onClick={() => onVoteHelpful?.(review.id)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors group"
                aria-label="Mark as helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{review.helpfulCount}</span>
              </button>
              <button
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors group"
                aria-label="Mark as not helpful"
              >
                <ThumbsDown className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Mentor response */}
            {review.mentorResponse && (
              <div className="mt-3 ml-8 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <span className="font-semibold text-gray-700">Mentor: </span>
                <span className="text-gray-600 italic">"{review.mentorResponse.text}"</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page === totalPages}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
