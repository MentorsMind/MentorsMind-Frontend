import React from 'react';
import type { LearningPathRecommendation } from '../../types';

interface LearningPathProps {
  path: LearningPathRecommendation;
  onBookmark: (pathId: string) => void;
}

const LearningPath: React.FC<LearningPathProps> = ({ path, onBookmark }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-stellar">
            Learning Path Visualization
          </div>
          <h3 className="mt-2 text-2xl font-black text-gray-900">{path.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{path.explanation}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-gray-50 px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              Goal completion
            </div>
            <div className="mt-1 text-lg font-black text-gray-900">{path.estimatedWeeks} weeks</div>
          </div>
          <button
            type="button"
            onClick={() => onBookmark(path.id)}
            className={`rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              path.bookmarked
                ? 'bg-gray-900 text-white'
                : 'border border-gray-100 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {path.bookmarked ? 'Bookmarked path' : 'Bookmark path'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {path.steps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black ${
                    step.status === 'in-progress'
                      ? 'bg-stellar text-white'
                      : step.status === 'next'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {index + 1}
                </div>
                {index < path.steps.length - 1 && <div className="mt-2 h-full w-px bg-gray-200" />}
              </div>

              <div className="flex-1 rounded-3xl bg-gray-50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-black text-gray-900">{step.title}</h4>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                    {step.durationWeeks} week{step.durationWeeks > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {step.resources.map((resource) => (
                    <span key={resource} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500">
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-gray-100 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
            Recommended topics & courses
          </div>
          <div className="mt-4 space-y-3">
            {path.topics.map((topic) => (
              <div key={topic.id} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-gray-900">{topic.title}</div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    {topic.type}
                  </span>
                </div>
                <div className="mt-2 text-xs font-semibold text-gray-400">{topic.duration}</div>
                <p className="mt-2 text-sm text-gray-600">{topic.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPath;
