import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormWizard from '../components/forms/FormWizard';
import Input from '../components/ui/Input';
import Select from '../components/forms/Select';
import Checkbox from '../components/forms/Checkbox';

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const INTERESTS = ['React', 'TypeScript', 'Python', 'Rust', 'Blockchain', 'ML', 'DevOps', 'Node.js'];

export default function LearnerOnboarding() {
  const navigate = useNavigate();
  const [level, setLevel] = useState('beginner');
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState('');

  const toggleInterest = (s: string) =>
    setInterests(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const steps = [
    {
      title: 'Skill Level',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">What's your experience level?</h2>
          <Select options={LEVELS} value={level} onChange={setLevel} />
        </div>
      ),
    },
    {
      title: 'Interests',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">What do you want to learn?</h2>
          <div className="grid grid-cols-2 gap-2">
            {INTERESTS.map(s => (
              <Checkbox key={s} label={s} checked={interests.includes(s)} onChange={() => toggleInterest(s)} />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Goals',
      content: (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">What's your main goal?</h2>
          <Input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Get a job as a frontend developer" />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to MentorMinds</h1>
          <p className="text-sm text-gray-500 mt-1">Let's personalize your learning journey</p>
        </div>
        <FormWizard steps={steps} onComplete={() => navigate('/learner/dashboard')} />
      </div>
    </div>
  );
}
