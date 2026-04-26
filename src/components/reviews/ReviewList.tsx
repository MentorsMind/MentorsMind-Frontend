import React, { useState } from 'react';
import type { Review, RatingStats } from '../../types';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
  stats: RatingStats;
  onVoteHelpful: (id: string) => Promise<void> | void;
  alreadyVotedReviewIds?: Set<string>;
  onFilterChange: (rating: number | null) => void;
  currentFilter: number | null;
  onAddResponse: (id: string, text: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  stats,
  onVoteHelpful,
  alreadyVotedReviewIds,
  onFilterChange,
  currentFilter,
  onAddResponse,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [responseIds, setResponseIds] = useState<Set<string>>(new Set());
  const [responseText, setResponseText] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Filtering Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <h3 className="text-xl font-bold text-gray-900">Patient Reviews</h3>
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
          <div className="py-12 text-center text-gray-500">
            No reviews match the selected filter.
          </div>
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
                          Verified Session
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{review.date}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <button className="text-gray-300 hover:text-red-400 transition-colors" title="Flag as inappropriate">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{review.comment}</p>

              <div className="flex items-center gap-6">
                <button
                  onClick={() => onVoteHelpful(review.id)}
                  disabled={alreadyVotedReviewIds?.has(review.id)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-stellar transition-colors group disabled:cursor-not-allowed disabled:text-amber-600"
                >
                  <svg className="w-4 h-4 group-active:scale-125 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708c.95 0 1.708.758 1.708 1.708 0 .428-.158.834-.442 1.15l-3.267 3.5c-.284.316-.69.475-1.117.475H9.708C8.758 18.833 8 18.075 8 17.125V10c0-.427.158-.833.442-1.15L12 5l1 1v4zM4 11h3v8H4z" />
                  </svg>
                  {alreadyVotedReviewIds?.has(review.id) ? 'Already voted' : `Helpful (${review.helpfulCount})`}
                </button>

                <button
                  onClick={() => toggleResponse(review.id)}
                  className="text-xs font-semibold text-gray-400 hover:text-stellar transition-colors"
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
