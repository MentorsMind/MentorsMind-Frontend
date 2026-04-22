import { useState, useMemo } from 'react';
import type { Review, RatingStats } from '../types';
import api from '../services/api.client';

const generateMockReviews = (): Review[] => [
  {
    id: '1',
    bookingId: 'b1',
    mentorId: 'm1',
    reviewerId: 'u1',
    reviewerName: 'Alex Johnson',
    rating: 5,
    comment: 'Exceptional guidance on blockchain architecture. Very clear explanation of Stellar smart contracts.',
    createdAt: '2025-10-15T10:00:00Z',
    helpfulCount: 12,
    isVerified: true,
    mentorResponse: {
      text: 'Thanks Alex! It was great working on those concepts with you.',
      date: '2025-10-16',
    },
  },
  {
    id: '2',
    bookingId: 'b2',
    mentorId: 'm1',
    reviewerId: 'u2',
    reviewerName: 'Sarah Smith',
    rating: 4,
    comment: 'Solid session, helped me debug my wallet integration. A bit fast-paced but very knowledgeable.',
    createdAt: '2025-11-02T14:00:00Z',
    helpfulCount: 5,
    isVerified: true,
    isFlagged: false,
  },
  {
    id: '3',
    bookingId: 'b3',
    mentorId: 'm1',
    reviewerId: 'u3',
    reviewerName: 'John Doe',
    rating: 3,
    comment: 'Good overall but I expected more hands-on practice. The theory part was too long.',
    createdAt: '2025-11-20T09:00:00Z',
    helpfulCount: 2,
    isVerified: false,
  },
];

export const useReviews = (mentorId: string) => {
  const [reviews, setReviews] = useState<Review[]>(generateMockReviews());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filterRating !== null) {
      result = result.filter((r) => Math.floor(r.rating) === filterRating);
    }
    return result;
  }, [reviews, filterRating]);

  const stats: RatingStats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => Math.floor(r.rating) === star).length,
    }));
    return {
      average: avg,
      totalReviews: total,
      distribution,
      trends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [4.2, 4.5, 4.3, 4.8, 4.6, 4.7],
      },
    };
  }, [reviews]);

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'helpfulCount' | 'mentorId'>) => {
    const review: Review = {
      ...reviewData,
      mentorId,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };
    setReviews((prev) => [review, ...prev]);
  };

  const markHelpful = async (reviewId: string) => {
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)),
    );
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
    } catch {
      // Rollback on failure
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount - 1 } : r)),
      );
    }
  };

  const editReview = async (reviewId: string, data: { rating: number; comment: string }) => {
    const original = reviews.find((r) => r.id === reviewId);
    // Optimistic update
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, ...data } : r)),
    );
    try {
      await api.put(`/reviews/${reviewId}`, data);
    } catch {
      // Rollback on failure
      if (original) {
        setReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? original : r)),
        );
      }
    }
  };

  const voteHelpful = markHelpful; // alias for backward compat

  const addMentorResponse = (reviewId: string, text: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, mentorResponse: { text, date: new Date().toISOString().split('T')[0] } }
          : r,
      ),
    );
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return {
    reviews: filteredReviews.slice(
      (currentPage - 1) * REVIEWS_PER_PAGE,
      currentPage * REVIEWS_PER_PAGE,
    ),
    allReviews: reviews,
    stats,
    filterRating,
    setFilterRating,
    addReview,
    voteHelpful,
    markHelpful,
    editReview,
    addMentorResponse,
    currentPage,
    paginate,
    totalPages: Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE),
  };
};
