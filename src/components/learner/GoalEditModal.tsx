import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { Goal, GoalCategory } from '../../types';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: (goal: Goal) => Promise<void>;
}

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'career', label: 'Career' },
  { value: 'project', label: 'Project' },
  { value: 'certification', label: 'Certification' },
  { value: 'soft-skills', label: 'Soft Skills' },
];

export default function GoalEditModal({ isOpen, onClose, goal, onSave }: GoalEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<GoalCategory>('technical');
  const [specific, setSpecific] = useState('');
  const [measurable, setMeasurable] = useState('');
  const [achievable, setAchievable] = useState('');
  const [relevant, setRelevant] = useState('');
  const [timeBound, setTimeBound] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setDeadline(goal.deadline);
      setCategory(goal.category);
      setSpecific(goal.specific);
      setMeasurable(goal.measurable);
      setAchievable(goal.achievable);
      setRelevant(goal.relevant);
      setTimeBound(goal.timeBound);
      setNotes(goal.notes || '');
    }
  }, [goal]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setCategory('technical');
    setSpecific('');
    setMeasurable('');
    setAchievable('');
    setRelevant('');
    setTimeBound('');
    setNotes('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!deadline) errs.deadline = 'Target date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !goal) return;

    setIsSubmitting(true);
    try {
      const updatedGoal: Goal = {
        ...goal,
        title,
        description,
        deadline,
        category,
        specific,
        measurable,
        achievable,
        relevant,
        timeBound,
        notes,
      };
      await onSave(updatedGoal);
      reset();
      onClose();
    } catch (err: any) {
      console.error('Failed to update goal:', err);
      setErrors({ submit: err?.message || 'Failed to update goal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Goal" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Goal Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none ${
                errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>
          <Input
            label="Target Date"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            error={errors.deadline}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">SMART Breakdown</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Specific</label>
              <textarea value={specific} onChange={(e) => setSpecific(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Measurable</label>
              <textarea value={measurable} onChange={(e) => setMeasurable(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Achievable</label>
              <textarea value={achievable} onChange={(e) => setAchievable(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Relevant</label>
              <textarea value={relevant} onChange={(e) => setRelevant(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Time-Bound</label>
              <textarea value={timeBound} onChange={(e) => setTimeBound(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-stellar resize-none" />
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <p className="text-xs text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
