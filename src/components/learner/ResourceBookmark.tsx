import React, { useState } from 'react';
import type { BookmarkedResource } from '../../types';

interface ResourceBookmarkProps {
  resources: BookmarkedResource[];
  onAdd: (title: string, url: string, tags: string[]) => void;
}

const ResourceBookmark: React.FC<ResourceBookmarkProps> = ({ resources, onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState('');

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    onAdd(
      title.trim(),
      url.trim(),
      tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    );
    setTitle('');
    setUrl('');
    setTags('');
  };

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-black text-gray-900">Resource Bookmarks</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Resource title"
          className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://resource-link"
          className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
        />
        <div className="flex gap-3">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="tags, comma, separated"
            className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
          />
          <button type="button" onClick={handleAdd} className="rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white">
            Add
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {resources.map((resource) => (
          <div key={resource.id} className="rounded-3xl bg-gray-50 p-4">
            <div className="text-sm font-black text-gray-900">{resource.title}</div>
            <div className="mt-1 text-sm text-gray-500">{resource.url}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceBookmark;
