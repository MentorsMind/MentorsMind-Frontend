import React from 'react';
import { useRecommendations } from '../../hooks/useRecommendations';
import RecommendedMentors from './RecommendedMentors';
import LearningPath from './LearningPath';
import SkillRoadmap from './SkillRoadmap';

const LearningRecommendations: React.FC = () => {
  const {
    mentors,
    paths,
    bookmarkedPaths,
    estimatedTimeToGoal,
    toggleMentorBookmark,
    setMentorFeedback,
    togglePathBookmark,
  } = useRecommendations();

  const featuredPath = paths[0];

  return (
    <section className="space-y-6">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-stellar">
              AI Learning Recommendations
            </div>
            <h2 className="mt-2 text-3xl font-black text-gray-900">Your next best moves</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              Personalized mentor matches, suggested learning sequences, and roadmap guidance based on your recent sessions and growth goals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <div className="rounded-3xl bg-gray-50 px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Time to goal
              </div>
              <div className="mt-1 text-2xl font-black text-gray-900">{estimatedTimeToGoal} weeks</div>
            </div>
            <div className="rounded-3xl bg-gray-50 px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                Bookmarked paths
              </div>
              <div className="mt-1 text-2xl font-black text-gray-900">{bookmarkedPaths.length}</div>
            </div>
          </div>
        </div>
      </div>

      <RecommendedMentors
        mentors={mentors}
        onBookmark={toggleMentorBookmark}
        onFeedback={setMentorFeedback}
      />

      <LearningPath path={featuredPath} onBookmark={togglePathBookmark} />
      <SkillRoadmap roadmap={featuredPath.roadmap} />
    </section>
  );
};

export default LearningRecommendations;
