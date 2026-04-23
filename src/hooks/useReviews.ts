import { useState, useMemo } from 'react';
import type { Review, RatingStats } from '../types';

// Mock data generator
const generateMockReviews = (): Review[] => [
  {
    id: '1',
    mentorId: 'm1',
    reviewerId: 'u1',
    reviewerName: 'Alex Johnson',
    rating: 5,
    comment: 'Exceptional guidance on blockchain architecture. Very clear explanation of Stellar smart contracts.',
    date: '2025-10-15',
    helpfulCount: 12,
    isVerified: true,
    mentorResponse: {
      text: 'Thanks Alex! It was great working on those concepts with you.',
      date: '2025-10-16'
    }
  },
  {
    id: '2',
    mentorId: 'm1',
    reviewerId: 'u2',
    reviewerName: 'Sarah Smith',
    rating: 4,
    comment: 'Solid session, helped me debug my wallet integration. A bit fast-paced but very knowledgeable.',
    date: '2025-11-02',
    helpfulCount: 5,
    isVerified: true,
    isFlagged: false
  },
  {
    id: '3',
    mentorId: 'm1',
    reviewerId: 'u3',
    reviewerName: 'John Doe',
    rating: 3,
    comment: 'Good overall but I expected more hands-on practice. The theory part was too long.',
    date: '2025-11-20',
    helpfulCount: 2,
    isVerified: false,
  }
];

export const useReviews = (mentorId: string) => {
  const [reviews, setReviews] = useState<Review[]>(generateMockReviews());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REVIEWS_PER_PAGE = 5;

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (filterRating !== null) {
      result = result.filter(r => Math.floor(r.rating) === filterRating);
    }
    return result;
  }, [reviews, filterRating]);

  const stats: RatingStats = useMemo(() => {
    const total = reviews.length;
    const avg = total > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
    
    const distribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => Math.floor(r.rating) === star).length
    }));

    return {
      average: avg,
      totalReviews: total,
      distribution,
      trends: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        values: [4.2, 4.5, 4.3, 4.8, 4.6, 4.7]
      }
    };
  }, [reviews]);

  const addReview = async (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'mentorId'>) => {
    const prevReviews = [...reviews];
    const review: Review = {
      ...reviewData,
      mentorId,
      reviewerId: reviewData.reviewerId || 'anon-' + Math.random().toString(36).substr(2, 5),
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };

    // Optimistic update
    setReviews(prev => [review, ...prev]);

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.1) reject(new Error('Failed to submit review'));
          else resolve(true);
        }, 1500);
      });
    } catch (err) {
      // Rollback
      setReviews(prevReviews);
      console.error('Failed to submit review:', err);
      // In a real app, show a toast error
      alert(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const voteHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
    ));
  };

  const addMentorResponse = (reviewId: string, text: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { 
        ...r, 
        mentorResponse: { text, date: new Date().toISOString().split('T')[0] } 
      } : r
    ));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return {
    reviews: filteredReviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE),
    allReviews: reviews,
    stats,
    filterRating,
    setFilterRating,
    addReview,
    voteHelpful,
    addMentorResponse,
    currentPage,
    paginate,
    totalPages: Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
  };
};
