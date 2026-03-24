import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) onRatingChange(index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!interactive || !onRatingChange) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onRatingChange(Math.min(index + 1, maxRating));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onRatingChange(Math.max(index - 1, 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onRatingChange(index);
    }
  };

  const renderStar = (index: number) => {
    const activeRating = hoverRating !== null ? hoverRating : rating;
    const isFull = activeRating >= index;
    const isHalf = !isFull && activeRating >= index - 0.5;
    const label = `${index} star${index !== 1 ? 's' : ''}`;

    return (
      <button
        key={index}
        type="button"
        aria-label={interactive ? `Rate ${label}` : label}
        aria-pressed={interactive ? rating === index : undefined}
        tabIndex={interactive ? (rating === index || (rating === 0 && index === 1) ? 0 : -1) : -1}
        disabled={!interactive}
        className={[
          interactive ? 'cursor-pointer' : 'cursor-default',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stellar focus-visible:ring-offset-1 rounded',
          'transition-transform duration-150',
        ].join(' ')}
        onMouseEnter={() => interactive && setHoverRating(index)}
        onMouseLeave={() => interactive && setHoverRating(null)}
        onClick={() => handleClick(index)}
        onKeyDown={(e) => handleKeyDown(e, index)}
      >
        <svg
          className={`${starSizes[size]} ${isFull || isHalf ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {isHalf && (
            <defs>
              <linearGradient id={`halfStar-${index}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={isHalf ? `url(#halfStar-${index})` : isFull ? 'currentColor' : 'none'}
          />
        </svg>
      </button>
    );
  };

  return (
    <div
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Star rating' : `Rated ${rating} out of ${maxRating} stars`}
      className={`flex items-center space-x-1 ${className}`}
    >
      {Array.from({ length: maxRating }, (_, i) => renderStar(i + 1))}
    </div>
  );
};

export default StarRating;
