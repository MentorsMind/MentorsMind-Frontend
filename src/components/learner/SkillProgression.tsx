import React from 'react';
import type { LearningProgressData } from '../../types';

interface SkillProgressionProps {
  progress: LearningProgressData;
}

const SkillProgression: React.FC<SkillProgressionProps> = ({ progress }) => {
  const latest = progress.skillProgression[progress.skillProgression.length - 1];

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-gray-900">Skill Level Badges</h3>
      <p className="mt-1 text-sm text-gray-500">Current standing across your most active learning areas.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Stellar', value: latest.stellar },
          { label: 'Soroban', value: latest.soroban },
          { label: 'Product Thinking', value: latest.product },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl bg-gray-50 p-5 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-gray-900">{item.value}%</div>
            <div className="mt-2 inline-flex rounded-full bg-stellar/10 px-3 py-1 text-xs font-bold text-stellar">
              {item.value >= 70 ? 'Advanced' : item.value >= 40 ? 'Intermediate' : 'Beginner'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillProgression;
