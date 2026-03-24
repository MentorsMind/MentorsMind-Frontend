import React from 'react';
import { SearchOptions } from '../../services/search.service';
import { ChevronDown, BarChart3 } from 'lucide-react';

interface SortOptionsProps {
  sortBy: SearchOptions['sortBy'];
  onSortChange: (sortBy: SearchOptions['sortBy']) => void;
  resultCount: number;
}

const SortOptions: React.FC<SortOptionsProps> = ({ sortBy, onSortChange, resultCount }) => {
  const options: { value: SearchOptions['sortBy']; label: string }[] = [
    { value: 'relevance', label: 'Recommended' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ];

  return (
    <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </div>
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{resultCount}</span> results
        </p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sort by</label>
        <div className="relative group">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SearchOptions['sortBy'])}
            className="appearance-none bg-gray-50 border border-transparent hover:border-blue-200 px-5 py-2.5 pr-10 rounded-2xl text-sm font-semibold text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default SortOptions;
