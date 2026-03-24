import React from 'react';
import type { SkillRoadmapItem } from '../../types';

interface SkillRoadmapProps {
  roadmap: SkillRoadmapItem[];
}

const SkillRoadmap: React.FC<SkillRoadmapProps> = ({ roadmap }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900">Skill Progression Roadmap</h3>
          <p className="mt-1 text-sm text-gray-500">
            Track where you are now and what success looks like next.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {roadmap.map((item) => (
          <div key={item.skill} className="rounded-3xl bg-gray-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-lg font-black text-gray-900">{item.skill}</div>
                <p className="mt-1 text-sm text-gray-600">{item.milestone}</p>
              </div>
              <div className="text-sm font-semibold text-gray-500">
                {item.currentLevel} to {item.targetLevel}
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-stellar to-cyan-500 transition-all"
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <div className="mt-2 text-right text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
              {item.progress}% to target
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRoadmap;
