import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Pencil } from 'lucide-react';
import type { Review, RatingStats } from '../../types';
import StarRating from './StarRating';

const HOURS_48 = 48 * 60 * 60 * 1000;

interface ReviewListProps {
  reviews: Review[];
  stats: RatingStats;
  currentUserId?: string;
  onVoteHelpful: (id: string) => void;
  onEdit?: (id: string, data: { rating: number; comment: string }) => void;
  onFilterChange: (rating: number | null) => void;
  currentFilter: number | null;
  onAddResponse: (id: string, text: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STAR_LABELS: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' };

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  stats,
  currentUserId,
  onVoteHelpful,
  onEdit,
  onFilterChange,
  currentFilter,
  onAddResponse,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [responseIds, setResponseIds] = useState<Set<string>>(new Set());
  const [responseText, setResponseText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editHovered, setEditHovered] = useState(0);
  const [editComment, setEditComment] = useState('');

  const toggleResponse = (id: string) => {
    const next = new Set(responseIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setResponseIds(next);
  };

  const handleResponseSubmit = (id: string) => {
    onAddResponse(id, responseText);
    setResponseText('');
    toggleResponse(id);
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

  const canEdit = (review: Review) => {
    if (!currentUserId || review.reviewerId !== currentUserId) return false;
    return Date.now() - new Date(review.createdAt).getTime() < HOURS_48;
  };

  return (
    <div className="space-y-6">
      {/* Filtering Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-900">Reviews</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => onFilterChange(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              currentFilter === null ? 'bg-stellar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({stats.totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution.find((d) => d.star === rating)?.count || 0;
            return (
              <button
                key={rating}
                onClick={() => onFilterChange(rating)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-colors ${
                  currentFilter === rating ? 'bg-stellar text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rating} ★ ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No reviews match the selected filter.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="py-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stellar/10 flex items-center justify-center text-stellar font-bold uppercase">
                    {review.reviewerName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{review.reviewerName}</span>
                      {review.isVerified && (
                        <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-100">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StarRating rating={review.rating} size="sm" />
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
                <div className="mb-4 rounded-2xl border border-stellar/20 bg-stellar/5 p-4 space-y-3">
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
                <p className="text-gray-600 leading-relaxed mb-6">{review.comment}</p>
              )}

              {/* Helpful votes */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 font-medium">Was this helpful?</span>
                <button
                  onClick={() => onVoteHelpful(review.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition-colors group"
                  aria-label="Mark as helpful"
                >
                  <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{review.helpfulCount}</span>
                </button>
                <button
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors group"
                  aria-label="Mark as not helpful"
                >
                  <ThumbsDown className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={() => toggleResponse(review.id)}
                  className="ml-auto text-xs font-semibold text-gray-400 hover:text-stellar transition-colors"
                >
                  {review.mentorResponse ? 'View Response' : 'Reply'}
                </button>
              </div>

              {/* Mentor Response Section */}
              {(review.mentorResponse || responseIds.has(review.id)) && (
                <div className="mt-6 ml-10 p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="w-8 h-8 rounded-full bg-stellar flex items-center justify-center text-white text-[10px] font-bold">M</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">Mentor's Response</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                        {review.mentorResponse?.date || 'Today'}
                      </span>
                    </div>
                    {review.mentorResponse ? (
                      <p className="text-sm text-gray-600 italic">"{review.mentorResponse.text}"</p>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          autoFocus
                          className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-stellar outline-none"
                          placeholder="Type your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResponseSubmit(review.id)}
                            className="bg-stellar text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => toggleResponse(review.id)}
                            className="text-gray-400 px-4 py-1.5 text-xs font-bold hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-gray-100">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg font-bold transition-all ${
                currentPage === page ? 'bg-stellar text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
