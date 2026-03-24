import React from 'react';
import { useProgress } from '../../hooks/useProgress';
import ProgressDashboard from './ProgressDashboard';
import SkillProgression from './SkillProgression';
import GoalCompletion from './GoalCompletion';
import Achievements from './Achievements';

const LearningProgress: React.FC = () => {
  const { progress, achievementProgress, nextAchievement, exportProgressReport } = useProgress();

  return (
    <section className="space-y-6">
      <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-stellar">
              Learning Progress
            </div>
            <h2 className="mt-2 text-3xl font-black text-gray-900">Progress dashboard with momentum signals</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
              Track goal completion, skill progression, learning streaks, achievements, and downloadable progress reports.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-3xl bg-gray-50 px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Achievement progress</div>
              <div className="mt-1 text-2xl font-black text-gray-900">{achievementProgress}%</div>
            </div>
            <button
              type="button"
              onClick={exportProgressReport}
              className="rounded-2xl bg-stellar px-5 py-4 text-sm font-black text-white"
            >
              Generate Progress Report
            </button>
          </div>
        </div>
        {nextAchievement && (
          <div className="mt-5 rounded-3xl bg-gray-50 px-5 py-4 text-sm text-gray-600">
            Next achievement to unlock: <span className="font-bold text-gray-900">{nextAchievement.title}</span>
          </div>
        )}
      </div>

      <ProgressDashboard progress={progress} />
      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <SkillProgression progress={progress} />
        <GoalCompletion goals={progress.goals} />
      </div>
      <Achievements achievements={progress.achievements} celebration={progress.milestoneCelebration} />
    </section>
  );
};

export default LearningProgress;
