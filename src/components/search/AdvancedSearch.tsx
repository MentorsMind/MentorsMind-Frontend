import React from 'react';
import { X, Search, Sliders, CheckCircle2 } from 'lucide-react';
import type { SearchFilters } from '../../services/search.service';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose, filters, onApply }) => {
  const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters);

  if (!isOpen) return null;

  const contentTypes = ['article', 'video', 'course'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex items-center justify-between bg-linear-to-r from-blue-50/50 to-indigo-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <Sliders className="h-6 w-6 text-blue-600" /> Advanced Discovery
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Refine your search with granular parameters</p>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-lg transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Content Type Selection */}
          <section>
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">Preferred Content Types</label>
            <div className="grid grid-cols-3 gap-4">
              {contentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const current = localFilters.contentType || [];
                    const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
                    setLocalFilters({ ...localFilters, contentType: next });
                  }}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    localFilters.contentType?.includes(type)
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xl shadow-blue-100'
                      : 'border-gray-100 hover:border-gray-200 text-gray-500'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    localFilters.contentType?.includes(type) ? 'bg-blue-600 text-white' : 'bg-gray-50'
                  }`}>
                    <CheckCircle2 className={`h-6 w-6 ${localFilters.contentType?.includes(type) ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                  <span className="text-sm font-bold capitalize">{type}s</span>
                </button>
              ))}
            </div>
          </section>

          {/* Expert Level Section (Conceptual for now) */}
          <section>
            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">Mentor Seniority</label>
            <div className="space-y-3">
              {['Foundational', 'Professional', 'Elite Expert'].map((level) => (
                <label key={level} className="flex items-center p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group">
                  <input type="checkbox" className="h-5 w-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 mr-4" />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-gray-700 block">{level}</span>
                    <span className="text-xs text-gray-400 font-medium">Verified track record in {level.toLowerCase()} mentorship</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={() => setLocalFilters({})}
            className="text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
          >
            Reset All
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onApply(localFilters);
                onClose();
              }}
              className="px-8 py-3 bg-gray-900 text-white text-sm font-bold rounded-2xl shadow-xl shadow-gray-200 hover:bg-black hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <Search className="h-4 w-4" /> Apply Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
