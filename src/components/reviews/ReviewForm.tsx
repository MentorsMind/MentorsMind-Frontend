import React, { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (review: { rating: number; comment: string; reviewerName: string; isVerified: boolean }) => void;
  onCancel?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; comment?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (rating === 0) next.rating = 'Please select a rating.';
    if (!comment.trim()) next.comment = 'Please provide a comment.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit({ rating, comment, reviewerName: name || 'Anonymous', isVerified: true });
    
    // Reset form
    setRating(0);
    setComment('');
    setName('');
    setErrors({});
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Write a review form">

        {/* Star rating */}
        <div role="group" aria-labelledby="rating-label">
          <span id="rating-label" className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate this mentor?
          </span>
          <StarRating
            rating={rating}
            interactive
            onRatingChange={(v) => { setRating(v); setErrors(e => ({ ...e, rating: undefined })); }}
            size="lg"
          />
          {errors.rating && (
            <p id="rating-error" role="alert" className="mt-1 text-red-600 text-sm font-medium">
              {errors.rating}
            </p>
          )}
        </div>

        {/* Name */}
        <div>
          <label htmlFor="reviewer-name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            id="reviewer-name"
            type="text"
            autoComplete="name"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-stellar focus:border-transparent outline-none transition-all"
            placeholder="Anonymous"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-1">
            Review Details <span aria-hidden="true" className="text-red-500">*</span>
          </label>
          <textarea
            id="review-comment"
            rows={4}
            required
            aria-required="true"
            aria-describedby={errors.comment ? 'comment-error' : undefined}
            aria-invalid={!!errors.comment}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-stellar focus:border-transparent outline-none transition-all resize-none ${
              errors.comment ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="What was your experience like?"
            value={comment}
            onChange={(e) => { setComment(e.target.value); setErrors(err => ({ ...err, comment: undefined })); }}
          />
          {errors.comment && (
            <p id="comment-error" role="alert" className="mt-1 text-red-600 text-sm font-medium">
              {errors.comment}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2 bg-stellar text-white font-semibold rounded-lg hover:bg-stellar-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2"
          >
            Post Review
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
