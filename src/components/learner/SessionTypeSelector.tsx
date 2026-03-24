import React from 'react';
import type { BookingSessionType } from '../../types';

interface SessionTypeSelectorProps {
  value: BookingSessionType;
  onChange: (value: BookingSessionType) => void;
}

const OPTIONS: Array<{
  id: BookingSessionType;
  title: string;
  description: string;
}> = [
  {
    id: '1:1',
    title: '1:1',
    description: 'Personal mentoring with a dedicated roadmap and feedback.',
  },
  {
    id: 'group',
    title: 'Group',
    description: 'Collaborative learning with a lower per-seat price.',
  },
  {
    id: 'workshop',
    title: 'Workshop',
    description: 'Hands-on deep dives for projects, pair building, and demos.',
  },
];

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {OPTIONS.map((option) => {
        const active = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-3xl border p-4 text-left transition-all ${
              active
                ? 'border-stellar bg-stellar/5 shadow-lg shadow-stellar/10'
                : 'border-gray-100 bg-white hover:border-stellar/30 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-gray-900">{option.title}</span>
              <span
                className={`h-3 w-3 rounded-full ${
                  active ? 'bg-stellar' : 'bg-gray-200'
                }`}
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default SessionTypeSelector;
