import React from 'react';
import type { FeedbackCategoryRatings } from '../../types';
import RatingStars from './RatingStars';
import { SkillTagSelector } from '../mentor/SkillTagSelector';

interface FeedbackFormProps {
  rating: number;
  categories: FeedbackCategoryRatings;
  review: string;
  improvementSuggestions: string;
  anonymous: boolean;
  confirmationMessage: string;
  feedbackReminder: string;
  canSubmit: boolean;
  skillTags?: string[];
  setRating: (value: number) => void;
  setCategoryRating: (category: keyof FeedbackCategoryRatings, value: number) => void;
  setReview: (value: string) => void;
  setImprovementSuggestions: (value: string) => void;
  setAnonymous: (value: boolean) => void;
  setSkillTags?: (tags: string[]) => void;
  submitFeedback: () => boolean;
}

const CATEGORY_LABELS: Array<keyof FeedbackCategoryRatings> = [
  'communication',
  'knowledge',
  'helpfulness',
];

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  rating,
  categories,
  review,
  improvementSuggestions,
  anonymous,
  confirmationMessage,
  feedbackReminder,
  canSubmit,
  skillTags = [],
  setRating,
  setCategoryRating,
  setReview,
  setImprovementSuggestions,
  setAnonymous,
  setSkillTags,
  submitFeedback,
}) => {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-[0.22em] text-stellar">Post-session feedback</div>
        <h3 className="mt-2 text-2xl font-black text-gray-900">How did your last session go?</h3>
        <p className="mt-2 text-sm text-gray-500">{feedbackReminder}</p>

        <div className="mt-5">
          <div className="text-sm font-bold text-gray-900">Overall rating</div>
          <div className="mt-2">
            <RatingStars value={rating} onChange={setRating} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {CATEGORY_LABELS.map((category) => (
            <div key={category} className="rounded-3xl bg-gray-50 p-4">
              <div className="text-sm font-bold capitalize text-gray-900">{category}</div>
              <div className="mt-3">
                <RatingStars value={categories[category]} onChange={(value) => setCategoryRating(category, value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label htmlFor="review-text" className="mb-2 block text-sm font-bold text-gray-900">
              Written review
            </label>
            <textarea
              id="review-text"
              value={review}
              onChange={(event) => setReview(event.target.value)}
              className="min-h-32 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-stellar focus:bg-white"
            />
          </div>

          <div>
            <label htmlFor="improvement-text" className="mb-2 block text-sm font-bold text-gray-900">
              Improvement suggestions
            </label>
            <textarea
              id="improvement-text"
              value={improvementSuggestions}
              onChange={(event) => setImprovementSuggestions(event.target.value)}
              className="min-h-32 w-full rounded-3xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm outline-none focus:border-stellar focus:bg-white"
            />
          </div>
        </div>

        {setSkillTags && (
          <div className="mt-5">
            <SkillTagSelector
              selectedSkills={skillTags}
              onChange={setSkillTags}
              label="Skills you learned (optional)"
              placeholder="Add a skill..."
            />
          </div>
        )}

        <label className="mt-5 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
          <input type="checkbox" checked={anonymous} onChange={() => setAnonymous(!anonymous)} />
          Submit anonymously
        </label>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submitFeedback}
            disabled={!canSubmit}
            className="rounded-2xl bg-stellar px-5 py-4 text-sm font-black text-white disabled:opacity-50"
          >
            Submit feedback
          </button>
          {!canSubmit && (
            <div className="text-sm text-rose-500">Add an overall rating and all category ratings before submitting.</div>
          )}
        </div>

        {confirmationMessage && (
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700">
            {confirmationMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
