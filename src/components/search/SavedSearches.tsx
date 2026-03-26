import React from 'react';
import { Bookmark, Trash2, ArrowRight, Save } from 'lucide-react';
import type { SearchOptions } from '../../services/search.service';

interface SavedSearchesProps {
  savedSearches: { id: string, name: string, options: SearchOptions }[];
  onApply: (options: SearchOptions) => void;
  onSave: (name: string) => void;
  query: string;
}

const SavedSearches: React.FC<SavedSearchesProps> = ({ savedSearches, onApply, onSave, query }) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveName, setSaveName] = React.useState('');

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName);
      setSaveName('');
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-gray-900 text-lg">Saved Searches</h3>
        </div>
        {!isSaving ? (
          <button 
            onClick={() => setIsSaving(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Save className="h-3 w-3" /> Save Current
          </button>
        ) : (
          <button 
            onClick={() => setIsSaving(false)}
            className="text-xs font-bold text-gray-400 hover:text-gray-500"
          >
            Cancel
          </button>
        )}
      </div>

      {isSaving && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-2xl animate-in zoom-in-95 duration-200">
          <label className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2 block">Search Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g., Senior Blockchain Mentors"
              className="flex-1 bg-white border-transparent focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm px-3 py-2 outline-none"
              autoFocus
            />
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {savedSearches.length > 0 ? (
          savedSearches.map((search) => (
            <div 
              key={search.id}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer"
              onClick={() => onApply(search.options)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{search.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">Query: {search.options.query || 'Any'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-100">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 font-medium italic">No saved searches yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
