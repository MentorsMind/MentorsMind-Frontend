import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { GoalCategory } from '../../types';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    deadline: string;
    category: GoalCategory;
  }) => Promise<void>;
}

const CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'technical', label: 'Technical', icon: '💻' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'project', label: 'Project', icon: '🚀' },
  { value: 'certification', label: 'Certification', icon: '🎓' },
  { value: 'soft-skills', label: 'Soft Skills', icon: '🗣️' },
];

export default function AddGoalModal({ isOpen, onClose, onSave }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<GoalCategory>('technical');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setCategory('technical');
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
    // Ensure date is in the future
    if (deadline && new Date(deadline) < new Date().setHours(0, 0, 0, 0)) {
      errs.deadline = 'Target date must be in the future';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({ title, description, deadline, category });
      reset();
      onClose();
    } catch (err: any) {
      console.error('Failed to create goal:', err);
      setErrors({ submit: err?.message || 'Failed to create goal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Goal" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  category === cat.value
                    ? 'bg-stellar text-white border-stellar'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-stellar/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Goal Title"
          placeholder="e.g., Master Solidity Smart Contracts"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Briefly describe what you want to achieve..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-stellar focus:border-transparent resize-none ${
              errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
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
            Create Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
