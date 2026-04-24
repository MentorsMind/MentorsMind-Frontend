import React, { useState } from 'react';
import { EmptyState } from '../ui/EmptyState';
import { Star } from 'lucide-react';

export type Review = {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
};

// Kept your dummy data as a fallback so the UI doesn't break before API integration
const DUMMY_REVIEWS: Review[] = [
  { id: 1, name: 'Alice',  rating: 5, date: 'Feb 2026', comment: 'Very helpful mentor. Explained complex concepts with ease.' },
  { id: 2, name: 'David',  rating: 4, date: 'Jan 2026', comment: 'Explained things clearly. Would book again.' },
  { id: 3, name: 'Sara',   rating: 5, date: 'Jan 2026', comment: 'Fantastic session. Learned a lot about TypeScript generics.' },
  { id: 4, name: 'James',  rating: 3, date: 'Dec 2025', comment: 'Good session overall, though we ran a bit over time.' },
  { id: 5, name: 'Priya',  rating: 5, date: 'Dec 2025', comment: 'Super knowledgeable and patient. Highly recommend.' },
  { id: 6, name: 'Carlos', rating: 4, date: 'Nov 2025', comment: 'Clear explanations and great examples.' },
  { id: 7, name: 'Mei',    rating: 5, date: 'Nov 2025', comment: 'One of the best mentors I have worked with.' },
];

const PER_PAGE = 3;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

interface ReviewsListProps {
  reviews?: Review[];
}

export default function ReviewsList({ reviews = DUMMY_REVIEWS }: ReviewsListProps) {
  const [page, setPage] = useState(1);

  // Early return for the empty state
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

      <div className="space-y-4">
        {slice.map((r) => (
          <div key={r.id} className="rounded-2xl bg-gray-50 px-5 py-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">{r.name}</span>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
            <StarRating rating={r.rating} />
            <p className="text-sm text-gray-600">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
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