import { useCallback, useMemo, useState } from 'react';
import type { FeedbackCategoryRatings, SessionFeedbackEntry } from '../types';

const INITIAL_HISTORY: SessionFeedbackEntry[] = [
  {
    id: 'feedback-1',
    sessionId: 'sh1',
    sessionTitle: 'Stellar Smart Contracts Basics',
    mentorName: 'Sarah Chen',
    rating: 5,
    categories: {
      communication: 5,
      knowledge: 5,
      helpfulness: 4,
    },
    review: 'Really clear explanations and actionable follow-up suggestions.',
    improvementSuggestions: 'Would love one more concrete example next time.',
    anonymous: false,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const EMPTY_CATEGORIES: FeedbackCategoryRatings = {
  communication: 0,
  knowledge: 0,
  helpfulness: 0,
};

export const useFeedback = () => {
  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [rating, setRating] = useState(0);
  const [categories, setCategories] = useState<FeedbackCategoryRatings>(EMPTY_CATEGORIES);
  const [review, setReview] = useState('');
  const [improvementSuggestions, setImprovementSuggestions] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const feedbackReminder = 'Reminder: leave feedback within 24 hours while the session details are still fresh.';

  const canSubmit = useMemo(() => {
    return rating > 0 && Object.values(categories).every((value) => value > 0);
  }, [categories, rating]);

  const setCategoryRating = useCallback((category: keyof FeedbackCategoryRatings, value: number) => {
    setCategories((current) => ({ ...current, [category]: value }));
  }, []);

  const submitFeedback = useCallback(() => {
    if (!canSubmit) {
      return false;
    }

    const entry: SessionFeedbackEntry = {
      id: `feedback-${Date.now()}`,
      sessionId: 'sh2',
      sessionTitle: 'Soroban Development',
      mentorName: 'John Davis',
      rating,
      categories,
      review,
      improvementSuggestions,
      anonymous,
      submittedAt: new Date().toISOString(),
    };

    setHistory((current) => [entry, ...current]);
    setConfirmationMessage('Feedback submitted successfully. You can edit it within 24 hours.');
    setRating(0);
    setCategories(EMPTY_CATEGORIES);
    setReview('');
    setImprovementSuggestions('');
    setAnonymous(false);
    return true;
  }, [anonymous, canSubmit, categories, improvementSuggestions, rating, review]);

  const editFeedback = useCallback((feedbackId: string, nextReview: string) => {
    setHistory((current) =>
      current.map((entry) => {
        const submittedAgoMs = Date.now() - new Date(entry.submittedAt).getTime();
        const editable = submittedAgoMs <= 24 * 60 * 60 * 1000;
        if (entry.id !== feedbackId || !editable) {
          return entry;
        }

        return {
          ...entry,
          review: nextReview,
        };
      })
    );
  }, []);

  return {
    history,
    rating,
    categories,
    review,
    improvementSuggestions,
    anonymous,
    confirmationMessage,
    feedbackReminder,
    canSubmit,
    setRating,
    setCategoryRating,
    setReview,
    setImprovementSuggestions,
    setAnonymous,
    submitFeedback,
    editFeedback,
  };
};

