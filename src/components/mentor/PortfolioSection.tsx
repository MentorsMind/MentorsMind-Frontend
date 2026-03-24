import React, { useState } from 'react';
import type { PortfolioItem } from '../../hooks/useMentorProfile';

interface PortfolioSectionProps {
  items: PortfolioItem[];
  onAdd: (item: Omit<PortfolioItem, 'id'>) => void;
  onRemove: (id: string) => void;
}

export const PortfolioSection = ({ items, onAdd, onRemove }: PortfolioSectionProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Omit<PortfolioItem, 'id'>>({
    title: '',
    description: '',
    url: '',
    imageUrl: '',
    type: 'project',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.title && newItem.description) {
      onAdd(newItem);
      setNewItem({ title: '', description: '', url: '', imageUrl: '', type: 'project' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Portfolio & Experience</label>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isAdding ? 'Cancel' : '+ Add Item'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={newItem.type}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value as PortfolioItem['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="project">Project</option>
              <option value="certification">Certification</option>
              <option value="achievement">Achievement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
            <input
              type="url"
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add to Portfolio
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">{item.type}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-red-600 hover:text-red-800"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                View Project →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
