import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Goal { id: string; text: string; done: boolean; }

export default function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: 'Complete 10 React sessions', done: false },
    { id: '2', text: 'Build a full-stack project', done: true },
  ]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setGoals(prev => [...prev, { id: Date.now().toString(), text: input.trim(), done: false }]);
    setInput('');
  };

  const toggle = (id: string) => setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  const remove = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Add a learning goal..." value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <Button onClick={add}>Add</Button>
      </div>
      <ul className="space-y-2">
        {goals.map(g => (
          <li key={g.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <input type="checkbox" checked={g.done} onChange={() => toggle(g.id)} className="w-4 h-4 rounded text-indigo-600" />
            <span className={`flex-1 text-sm ${g.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{g.text}</span>
            <button onClick={() => remove(g.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
