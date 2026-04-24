import React, { useState } from 'react';
import type { ResourceLink } from '../../types/session.types';

interface ResourceLinksProps {
  links: ResourceLink[];
  onAdd: (title: string, url: string) => void;
  onRemove: (id: string) => void;
}

const ResourceLinks: React.FC<ResourceLinksProps> = ({ links, onAdd, onRemove }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    try { new URL(url.trim()); } catch {
      setError('Enter a valid URL (e.g. https://example.com).');
      return;
    }
    setError('');
    onAdd(title.trim(), url.trim());
    setTitle('');
    setUrl('');
  };

  return (
    <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-black text-gray-900">Resource Links</h4>
      <p className="mt-1 text-xs text-gray-400">Attach URLs to this session note for quick reference.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Link title"
          className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          type="url"
          className="flex-1 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-stellar focus:bg-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white hover:bg-gray-700 transition-colors"
        >
          Add
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {links.length > 0 && (
        <ul className="mt-4 space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3"
            >
              <div className="min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-sm font-bold text-stellar hover:underline"
                >
                  {link.title}
                </a>
                <span className="block truncate text-xs text-gray-400">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(link.id)}
                aria-label={`Remove ${link.title}`}
                className="shrink-0 rounded-full p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResourceLinks;
