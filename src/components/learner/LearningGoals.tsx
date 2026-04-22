import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

interface LearningGoalsProps {
  goals: string[];
  onChange: (goals: string[]) => void;
  suggestions?: string[];
}

export const LearningGoals: React.FC<LearningGoalsProps> = ({
  goals,
  onChange,
  suggestions = ['Stellar Development', 'Rust', 'Smart Contracts', 'Web3', 'Frontend'],
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddGoal = (goal: string) => {
    const trimmedGoal = goal.trim();
    if (trimmedGoal && !goals.includes(trimmedGoal)) {
      onChange([...goals, trimmedGoal]);
      setInputValue('');
    }
  };

  const handleRemoveGoal = (goal: string) => {
    onChange(goals.filter((g) => g !== goal));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGoal(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {goals.map((goal) => (
          <span
            key={goal}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {goal}
            <button
              type="button"
              onClick={() => handleRemoveGoal(goal)}
              className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a learning goal..."
          className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <button
          type="button"
          onClick={() => handleAddGoal(inputValue)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Suggested for you
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions
              .filter((s) => !goals.includes(s))
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleAddGoal(suggestion)}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
