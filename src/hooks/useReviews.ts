import type { AxiosError } from 'axios';
import { useState, useMemo, useCallback } from 'react';
import type { Review, RatingStats } from '../types';
import ReviewService, { type ReviewApiRecord } from '../services/review.service';

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
  const reviewService = new ReviewService();
  const [reviews, setReviews] = useState<Review[]>(generateMockReviews());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [alreadyVotedReviewIds, setAlreadyVotedReviewIds] = useState<Set<string>>(new Set());
  const [activeBookingReviewId, setActiveBookingReviewId] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const REVIEWS_PER_PAGE = 5;

  const isWithinEditWindow = useCallback((createdAt: string) => {
    return Date.now() - new Date(createdAt).getTime() < 48 * 3600 * 1000;
  }, []);

  const mapApiRecordToReview = useCallback((record: ReviewApiRecord): Review => {
    const createdAt = record.created_at;
    return {
      id: record.id,
      mentorId: record.mentor_id ?? mentorId,
      bookingId: record.booking_id ?? record.session_id,
      reviewerId: record.reviewer_id ?? 'current-user',
      reviewerName: record.reviewer_name ?? 'You',
      rating: record.rating,
      comment: record.comment,
      date: new Date(createdAt).toISOString().split('T')[0],
      created_at: createdAt,
      helpfulCount: record.helpful_count ?? 0,
      helpful_count: record.helpful_count ?? 0,
      isVerified: true,
    };
  }, [mentorId]);

  const upsertReview = useCallback((incoming: Review) => {
    setReviews((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === incoming.id);
      if (existingIndex === -1) {
        return [incoming, ...prev];
      }

      const next = [...prev];
      next[existingIndex] = { ...next[existingIndex], ...incoming };
      return next;
    });
  }, []);

  const loadReviewForBooking = useCallback(async (bookingId: string) => {
    try {
      const records = await reviewService.listByBooking(bookingId);
      if (!records.length) {
        setActiveBookingReviewId(null);
        return null;
      }

      const mapped = mapApiRecordToReview(records[0]);
      upsertReview(mapped);
      setActiveBookingReviewId(mapped.id);
      return mapped;
    } catch {
      const local = reviews.find((review) => review.bookingId === bookingId) ?? null;
      setActiveBookingReviewId(local?.id ?? null);
      return local;
    }
  }, [mapApiRecordToReview, reviewService, reviews, upsertReview]);

  const submitReview = useCallback(async (params: { bookingId: string; rating: number; comment: string }) => {
    setIsSubmittingReview(true);
    setReviewError(null);
    const { bookingId, rating, comment } = params;

    const localExisting = reviews.find((review) => review.bookingId === bookingId);
    const existing = localExisting ?? (await loadReviewForBooking(bookingId));

    try {
      if (existing) {
        const createdAt = existing.created_at ?? new Date().toISOString();
        if (!isWithinEditWindow(createdAt)) {
          setReviewError('The edit window for this review has expired');
          return { ok: false as const, mode: 'readonly' as const };
        }

        const updated = await reviewService.updateReview(existing.id, { rating, comment });
        const mapped = mapApiRecordToReview(updated);
        upsertReview(mapped);
        setActiveBookingReviewId(mapped.id);
        return { ok: true as const, mode: 'edit' as const };
      }

      const created = await reviewService.createReview({
        session_id: bookingId,
        rating,
        comment,
      });
      const mapped = mapApiRecordToReview(created);
      upsertReview(mapped);
      setActiveBookingReviewId(mapped.id);
      return { ok: true as const, mode: 'create' as const };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const status = axiosError.response?.status;
      const message = axiosError.response?.data?.message;

      // Duplicate review already exists: switch to edit flow automatically.
      if (status === 409) {
        const existingReview = await loadReviewForBooking(bookingId);
        if (existingReview) {
          setReviewError(null);
          return { ok: false as const, mode: 'edit' as const };
        }
      }

      if (status === 403 && message === 'The edit window for this review has expired') {
        setReviewError(message);
        return { ok: false as const, mode: 'readonly' as const };
      }

      setReviewError(message ?? 'Failed to submit review');
      return { ok: false as const, mode: 'error' as const };
    } finally {
      setIsSubmittingReview(false);
    }
  }, [isWithinEditWindow, loadReviewForBooking, mapApiRecordToReview, reviewService, reviews, upsertReview]);

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

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount' | 'mentorId'>) => {
    const review: Review = {
      ...reviewData,
      mentorId,
      reviewerId: reviewData.reviewerId || 'anon-' + Math.random().toString(36).substr(2, 5),
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };
    setReviews(prev => [review, ...prev]);
  };

  const voteHelpful = useCallback(async (reviewId: string) => {
    try {
      const response = await reviewService.voteHelpful(reviewId);
      setReviews(prev => prev.map(r =>
        r.id === reviewId
          ? { ...r, helpfulCount: response.helpful_count, helpful_count: response.helpful_count }
          : r
      ));
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 409) {
        setAlreadyVotedReviewIds((prev) => {
          const next = new Set(prev);
          next.add(reviewId);
          return next;
        });
      }
    }
  }, [reviewService]);

  const addMentorResponse = (reviewId: string, text: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { 
        ...r, 
        mentorResponse: { text, date: new Date().toISOString().split('T')[0] } 
      } : r
    ));
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getReviewForBooking = useCallback((bookingId: string) => {
    return reviews.find((review) => review.bookingId === bookingId) ?? null;
  }, [reviews]);

  const canEditReview = useCallback((review: Review | null) => {
    if (!review?.created_at) {
      return false;
    }
    return isWithinEditWindow(review.created_at);
  }, [isWithinEditWindow]);

  return {
    reviews: filteredReviews.slice((currentPage - 1) * REVIEWS_PER_PAGE, currentPage * REVIEWS_PER_PAGE),
    allReviews: reviews,
    stats,
    filterRating,
    setFilterRating,
    addReview,
    voteHelpful,
    addMentorResponse,
    loadReviewForBooking,
    getReviewForBooking,
    canEditReview,
    submitReview,
    isSubmittingReview,
    reviewError,
    activeBookingReviewId,
    alreadyVotedReviewIds,
    currentPage,
    paginate,
    totalPages: Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE)
  };
};
