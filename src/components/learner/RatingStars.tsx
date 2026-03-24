import React from 'react';

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }, (_, index) => {
        const star = index + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            onClick={() => onChange(star)}
            className={`text-2xl ${active ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
