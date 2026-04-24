import React from 'react';
import type { RecommendedMentor } from '../../types';
import SkeletonLoader from '../animations/SkeletonLoader';

interface RecommendedMentorsProps {
  mentors: RecommendedMentor[];
  onBookmark: (mentorId: string) => void;
  onFeedback: (mentorId: string, feedback: 'helpful' | 'not-helpful') => void;
  onDismiss?: (mentorId: string) => void;
  isLoading?: boolean;
}

const RecommendedMentors: React.FC<RecommendedMentorsProps> = ({
  mentors,
  onBookmark,
  onFeedback,
  onDismiss,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4">
                <SkeletonLoader className="h-16 w-16 rounded-2xl" />
                <div className="flex-1">
                  <SkeletonLoader className="h-6 w-48 mb-2" />
                  <SkeletonLoader className="h-4 w-32 mb-3" />
                  <div className="flex gap-2">
                    <SkeletonLoader className="h-6 w-16 rounded-full" />
                    <SkeletonLoader className="h-6 w-20 rounded-full" />
                    <SkeletonLoader className="h-6 w-14 rounded-full" />
                  </div>
                </div>
              </div>
              <SkeletonLoader className="h-10 w-24 rounded-2xl" />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <SkeletonLoader className="h-32 rounded-3xl" />
              <SkeletonLoader className="h-32 rounded-3xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="rounded-[2rem] border border-gray-100 bg-white p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No recommendations available</h3>
        <p className="text-sm text-gray-500">Check back later for personalized mentor recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mentors.map((mentor) => (
        <article
          key={mentor.id}
          className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              {mentor.avatar ? (
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="h-16 w-16 rounded-2xl border border-gray-100 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stellar text-xl font-black text-white">
                  {mentor.name[0]}
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-gray-900">{mentor.name}</h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    {mentor.matchScore}% match
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-gray-500">{mentor.title}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-500"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                  Est. time to goal
                </div>
                <div className="mt-1 text-lg font-black text-gray-900">
                  {mentor.estimatedWeeksToGoal} weeks
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onBookmark(mentor.id)}
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    mentor.bookmarked
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {mentor.bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
                {onDismiss && (
                  <button
                    type="button"
                    onClick={() => onDismiss(mentor.id)}
                    className="rounded-2xl px-4 py-3 text-sm font-bold border border-gray-100 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                    title="Not interested"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-gray-50 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                Why recommended
              </div>
              <div className="mt-3 space-y-3">
                {mentor.whyRecommended.map((reason) => (
                  <div key={reason.title}>
                    <div className="text-sm font-bold text-gray-900">{reason.title}</div>
                    <p className="text-sm leading-relaxed text-gray-600">{reason.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 p-5">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                Similar learner success story
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">
                {mentor.successStory.learnerName} started as a {mentor.successStory.startingPoint}.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Outcome: {mentor.successStory.outcome} in {mentor.successStory.timeframeWeeks} weeks.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onFeedback(mentor.id, 'helpful')}
                  className={`rounded-full px-3 py-2 text-xs font-bold ${
                    mentor.feedback === 'helpful'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  onClick={() => onFeedback(mentor.id, 'not-helpful')}
                  className={`rounded-full px-3 py-2 text-xs font-bold ${
                    mentor.feedback === 'not-helpful'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                >
                  Not helpful
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default RecommendedMentors;
