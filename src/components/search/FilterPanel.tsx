import React from 'react';
import { Filter, Sliders, Star, DollarSign, Calendar } from 'lucide-react';
import { SearchFilters } from '../../services/search.service';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const categories = ['Blockchain', 'UI/UX Design', 'Smart Contracts', 'Stellar Ecosystem', 'Rust', 'Frontend'];
  const availabilityOptions = ['Weekday morning', 'Weekday afternoon', 'Weekday evening', 'Weekend'];

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm sticky top-4">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="h-5 w-5 text-blue-600" />
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
      </div>

      <div className="space-y-8">
        {/* Categories */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 block">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.categories?.includes(category)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" /> Hourly Rate (XLM)
          </label>
          <div className="px-2">
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={filters.priceRange?.[1] || 200}
              onChange={(e) => onFilterChange({ ...filters, priceRange: [0, parseInt(e.target.value)] })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
              <span>0 XLM</span>
              <span>{filters.priceRange?.[1] || 200} XLM</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" /> Minimum Rating
          </label>
          <div className="space-y-2">
            {[4, 4.5, 4.8].map(rating => (
              <button
                key={rating}
                onClick={() => onFilterChange({ ...filters, minRating: rating })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                  filters.minRating === rating 
                    ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-1 font-medium">
                  {rating}+ <Star className="h-3 w-3 fill-current" />
                </span>
                {filters.minRating === rating && <div className="h-2 w-2 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Availability
          </label>
          <div className="space-y-2">
            {availabilityOptions.map(option => (
              <label key={option} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.availability?.includes(option)}
                  onChange={() => {
                    const current = filters.availability || [];
                    const next = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
                    onFilterChange({ ...filters, availability: next });
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors font-medium">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => onFilterChange({})}
        className="mt-8 w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors border-t border-gray-50 pt-6"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default FilterPanel;
