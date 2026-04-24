import { useState } from 'react';
import Button from '../ui/Button';
import Select from '../forms/Select';

const TOPICS = [
  { value: 'content', label: 'Content quality' },
  { value: 'communication', label: 'Communication' },
  { value: 'punctuality', label: 'Punctuality' },
  { value: 'other', label: 'Other' },
];

export default function FeedbackForm({ onSubmit }: { onSubmit?: (data: object) => void }) {
  const [topic, setTopic] = useState('content');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ topic, message });
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="text-center py-6 space-y-2">
      <div className="text-4xl">🙏</div>
      <p className="font-semibold text-gray-900">Feedback received!</p>
      <p className="text-sm text-gray-500">Thank you for helping us improve.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Topic" options={TOPICS} value={topic} onChange={setTopic} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required
          placeholder="Share your feedback..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
      </div>
      <Button type="submit" className="w-full">Submit Feedback</Button>
    </form>
  );
}
