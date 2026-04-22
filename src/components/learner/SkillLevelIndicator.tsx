import React from 'react';
import { SkillLevel } from '../../types';

interface SkillLevelIndicatorProps {
  skill: SkillLevel;
  onChange?: (level: SkillLevel['level']) => void;
  isEditable?: boolean;
}

const LEVELS: SkillLevel['level'][] = ['beginner', 'intermediate', 'advanced'];

export const SkillLevelIndicator: React.FC<SkillLevelIndicatorProps> = ({
  skill,
  onChange,
  isEditable = false,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{skill.topic}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
          {skill.level}
        </span>
      </div>
      <div className="flex space-x-1">
        {LEVELS.map((level, index) => {
          const isActive = LEVELS.indexOf(skill.level) >= index;
          return (
            <button
              key={level}
              type="button"
              disabled={!isEditable}
              onClick={() => onChange?.(level)}
              className={`h-2 flex-1 rounded-full transition-colors ${
                isActive
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              } ${isEditable ? 'cursor-pointer hover:bg-blue-400' : 'cursor-default'}`}
              title={level}
            />
          );
        })}
      </div>
    </div>
  );
};
