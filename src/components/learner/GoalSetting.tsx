import React, { useState } from 'react';
import type { Goal, GoalCategory } from '../../types';

type GoalFormData = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'milestones'> & {
  milestoneInputs: string[];
};

const CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'technical', label: 'Technical', icon: '💻' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'project', label: 'Project', icon: '🚀' },
  { value: 'certification', label: 'Certification', icon: '🎓' },
  { value: 'soft-skills', label: 'Soft Skills', icon: '🗣️' },
];

const EMPTY: GoalFormData = {
  title: '', description: '', category: 'technical',
  specific: '', measurable: '', achievable: '', relevant: '', timeBound: '',
  deadline: '', sharedWithMentor: false, reminderEnabled: false, notes: '',
  milestoneInputs: ['', '', ''],
};

interface GoalSettingProps {
  initial?: Goal | null;
  onSave: (data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const SMART_HINTS: Record<string, string> = {
  specific: 'What exactly do you want to accomplish? Be precise.',
  measurable: 'How will you know when you\'ve achieved it?',
  achievable: 'What steps and resources will you use?',
  relevant: 'Why does this goal matter to you right now?',
  timeBound: 'What is your target completion timeframe?',
};

const GoalSetting: React.FC<GoalSettingProps> = ({ initial, onSave, onCancel }) => {
  const [form, setForm] = useState<GoalFormData>(() => {
    if (!initial) return EMPTY;
    return {
      ...initial,
      milestoneInputs: initial.milestones.map(m => m.title),
    };
  });
  const [activeSmartField, setActiveSmartField] = useState<string | null>(null);

  const set = (key: keyof GoalFormData, value: GoalFormData[keyof GoalFormData]) =>
    setForm(f => ({ ...f, [key]: value }));

  const setMilestone = (i: number, value: string) => {
    const updated = [...form.milestoneInputs];
    updated[i] = value;
    setForm(f => ({ ...f, milestoneInputs: updated }));
  };

  const addMilestone = () => setForm(f => ({ ...f, milestoneInputs: [...f.milestoneInputs, ''] }));
  const removeMilestone = (i: number) =>
    setForm(f => ({ ...f, milestoneInputs: f.milestoneInputs.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const milestones = form.milestoneInputs
      .filter(t => t.trim())
      .map((title, i) => ({
        id: initial?.milestones[i]?.id ?? `m${Date.now()}${i}`,
        title,
        completed: initial?.milestones[i]?.completed ?? false,
        completedAt: initial?.milestones[i]?.completedAt,
        dueDate: initial?.milestones[i]?.dueDate,
      }));
    onSave({ ...form, milestones, status: initial?.status ?? 'active' });
  };

  const isValid = form.title.trim() && form.specific.trim() && form.deadline;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{initial ? 'Edit Goal' : 'New Goal'}</h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none" aria-label="Cancel">×</button>
      </div>

      {/* Title + category */}
      <div className="space-y-3">
        <div>
          <label htmlFor="goal-title" className="block text-xs font-semibold text-gray-500 mb-1.5">Goal Title</label>
          <input
            id="goal-title"
            type="text"
            required
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Master Solidity Smart Contracts"
            className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => set('category', c.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                  form.category === c.value ? 'border-stellar bg-stellar/5 text-stellar' : 'border-gray-100 text-gray-500 hover:border-gray-200'
                }`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="goal-desc" className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
          <textarea
            id="goal-desc"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Brief overview of this goal..."
            rows={2}
            className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm resize-none"
          />
        </div>
      </div>

      {/* SMART framework */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">SMART Framework</h4>
          <span className="text-[10px] text-gray-400">Click a field for guidance</span>
        </div>
        <div className="space-y-2">
          {(['specific', 'measurable', 'achievable', 'relevant', 'timeBound'] as const).map(field => (
            <div key={field}>
              <label htmlFor={`smart-${field}`} className="block text-xs font-semibold text-gray-500 mb-1 capitalize">
                {field === 'timeBound' ? 'Time-Bound' : field}
              </label>
              <input
                id={`smart-${field}`}
                type="text"
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                onFocus={() => setActiveSmartField(field)}
                onBlur={() => setActiveSmartField(null)}
                placeholder={SMART_HINTS[field]}
                className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm"
              />
              {activeSmartField === field && (
                <p className="text-[11px] text-stellar mt-1 pl-1">{SMART_HINTS[field]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Milestones</h4>
          <button type="button" onClick={addMilestone} className="text-xs font-bold text-stellar hover:underline">+ Add</button>
        </div>
        <div className="space-y-2">
          {form.milestoneInputs.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={m}
                onChange={e => setMilestone(i, e.target.value)}
                placeholder={`Milestone ${i + 1}`}
                className="flex-1 px-3 py-2 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm"
              />
              {form.milestoneInputs.length > 1 && (
                <button type="button" onClick={() => removeMilestone(i)} className="text-gray-300 hover:text-red-400 transition-colors px-1" aria-label="Remove milestone">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deadline + options */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="goal-deadline" className="block text-xs font-semibold text-gray-500 mb-1.5">Deadline</label>
          <input
            id="goal-deadline"
            type="date"
            required
            value={form.deadline}
            onChange={e => set('deadline', e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm"
          />
        </div>
        <div className="space-y-2 pt-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sharedWithMentor}
              onChange={e => set('sharedWithMentor', e.target.checked)}
              className="w-4 h-4 accent-stellar"
            />
            <span className="text-xs font-medium text-gray-600">Share with mentor</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.reminderEnabled}
              onChange={e => set('reminderEnabled', e.target.checked)}
              className="w-4 h-4 accent-stellar"
            />
            <span className="text-xs font-medium text-gray-600">Enable reminders</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="goal-notes" className="block text-xs font-semibold text-gray-500 mb-1.5">Notes (optional)</label>
        <textarea
          id="goal-notes"
          value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any additional context or motivation..."
          rows={2}
          className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:border-stellar outline-none transition-all text-sm resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-500 hover:border-gray-200 transition-all">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-2.5 bg-stellar text-white rounded-xl text-sm font-bold hover:bg-stellar-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-stellar/20"
        >
          {initial ? 'Save Changes' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
};

export default GoalSetting;
