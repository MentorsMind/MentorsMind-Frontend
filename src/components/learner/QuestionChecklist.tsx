import React from 'react';
import type { PrepChecklistItem } from '../../types';

interface QuestionChecklistProps {
  checklist: PrepChecklistItem[];
  onToggle: (itemId: string) => void;
}

const QuestionChecklist: React.FC<QuestionChecklistProps> = ({ checklist, onToggle }) => {
  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-gray-900">Question Preparation Checklist</h3>
      <p className="mt-1 text-sm text-gray-500">Prepare your questions and remove friction before the session starts.</p>

      <div className="mt-5 space-y-3">
        {checklist.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => onToggle(item.id)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-stellar focus:ring-stellar"
            />
            <span className={item.checked ? 'font-semibold text-gray-900' : ''}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default QuestionChecklist;
