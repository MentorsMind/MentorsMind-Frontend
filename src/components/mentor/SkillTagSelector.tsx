import React, { useState } from 'react';

interface SkillTagSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  label?: string;
  placeholder?: string;
  suggestions?: string[];
}

const defaultSuggestions = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'Leadership', 'Career Development', 'System Design', 'Data Science',
  'Machine Learning', 'DevOps', 'Cloud Architecture', 'Mobile Development'
];

export const SkillTagSelector = ({
  selectedSkills,
  onChange,
  label = 'Skills & Expertise',
  placeholder = 'Add a skill...',
  suggestions = defaultSuggestions,
}: SkillTagSelectorProps) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    (skill) =>
      skill.toLowerCase().includes(input.toLowerCase()) &&
      !selectedSkills.includes(skill)
  );

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      onChange([...selectedSkills, skill]);
      setInput('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(selectedSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addSkill(input.trim());
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((skill) => (
              <button
                key={skill}
                onClick={() => addSkill(skill)}
                className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
