import React, { useState } from 'react';
import { X, Send, Info, AlertCircle, FileText, Calendar, Layers } from 'lucide-react';

interface ProposalFormProps {
  onSubmit: (proposal: any) => void;
  onCancel: () => void;
}

const ProposalForm: React.FC<ProposalFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Constitutional',
    votingPeriod: '7',
    discussionUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        onSubmit({
          ...formData,
          id: Math.floor(Math.random() * 1000).toString(),
          status: 'Active',
          votes: '0 VP',
          createdAt: new Date().toISOString(),
        });
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Create New Proposal</h3>
          <p className="text-gray-500 mt-1">Submit a new proposal to the MentorMinds DAO.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6 text-gray-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-stellar" />
            Proposal Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Increase Mentor Reward Multiplier"
            className={`w-full rounded-xl border ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-4 text-gray-900 focus:border-stellar focus:ring-4 focus:ring-stellar/10 outline-none transition-all`}
          />
          {errors.title && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.title}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-stellar" />
              Proposal Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 p-4 text-gray-900 focus:border-stellar focus:ring-4 focus:ring-stellar/10 outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22gray%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem]"
            >
              <option value="Constitutional">Constitutional</option>
              <option value="Treasury">Treasury Allocation</option>
              <option value="Protocol">Protocol Upgrade</option>
              <option value="Community">Community Initiative</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="votingPeriod" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-stellar" />
              Voting Period (Days)
            </label>
            <input
              type="number"
              id="votingPeriod"
              name="votingPeriod"
              value={formData.votingPeriod}
              onChange={handleChange}
              min="3"
              max="30"
              className="w-full rounded-xl border border-gray-200 p-4 text-gray-900 focus:border-stellar focus:ring-4 focus:ring-stellar/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Info className="h-4 w-4 text-stellar" />
            Description & Rationale
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={6}
            placeholder="Detailed explanation of the proposal, background, and expected impact..."
            className={`w-full rounded-xl border ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-4 text-gray-900 focus:border-stellar focus:ring-4 focus:ring-stellar/10 outline-none transition-all resize-none`}
          />
          {errors.description && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {errors.description}</p>}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-4 font-bold text-gray-700 transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-[2] flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
              isSubmitting ? 'bg-stellar/50 cursor-not-allowed' : 'bg-stellar shadow-stellar/20 hover:bg-stellar-dark'
            }`}
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalForm;
