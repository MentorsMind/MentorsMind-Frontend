import React from 'react';
import type { AchievementBadge } from '../../types';
import CertificateCard from './CertificateCard';

interface AchievementBadgesProps {
  achievements: AchievementBadge[];
  onUnlock?: (id: string) => void;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ achievements, onUnlock }) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Achievement Badges</h3>
        <span className="text-xs uppercase tracking-widest text-gray-400">Gamification</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {achievements.map((badge) => (
          <div
            key={badge.id}
            className={`rounded-2xl border p-4 transition ${
              badge.unlocked
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="text-2xl">{badge.icon}</div>
            <h4 className="mt-2 text-sm font-bold text-gray-900">{badge.title}</h4>
            <p className="mt-1 text-xs text-gray-600">{badge.description}</p>
            {badge.unlocked && (
              <div className="mt-3">
                <CertificateCard
                  skill={badge.title}
                  earnedAt={badge.unlockedAt}
                  certificateId={badge.id}
                />
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-500">
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
              {!badge.unlocked && onUnlock && (
                <button
                  onClick={() => onUnlock(badge.id)}
                  className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Unlock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;
