import React from 'react';
import type { AchievementBadge } from '../../types';

interface AchievementsProps {
  achievements: AchievementBadge[];
  celebration?: string;
}

const Achievements: React.FC<AchievementsProps> = ({ achievements, celebration }) => {
  return (
    <div className="space-y-5">
      {celebration && (
        <div className="rounded-[2rem] bg-gradient-to-r from-amber-100 via-rose-50 to-white p-6">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Milestone Celebration</div>
          <p className="mt-2 text-lg font-black text-gray-900">{celebration}</p>
        </div>
      )}

      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-gray-900">Achievements</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-3xl border p-5 ${
                achievement.unlocked
                  ? 'border-emerald-100 bg-emerald-50'
                  : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className="text-3xl">{achievement.icon}</div>
              <div className="mt-3 text-lg font-black text-gray-900">{achievement.title}</div>
              <p className="mt-2 text-sm text-gray-600">{achievement.description}</p>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                {achievement.unlocked ? `Unlocked ${new Date(achievement.unlockedAt ?? '').toLocaleDateString()}` : 'In progress'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;
