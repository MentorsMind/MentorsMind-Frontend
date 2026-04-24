import { useState } from 'react';
import Badge from '../ui/Badge';

export interface MentorFilters {
  skills: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  availableOnly: boolean;
}

interface MentorFilterSidebarProps {
  filters: MentorFilters;
  onFiltersChange: (filters: MentorFilters) => void;
  availableSkills: string[];
}

export default function MentorFilterSidebar({
  filters,
  onFiltersChange,
  availableSkills,
}: MentorFilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice,
    filters.maxPrice,
  ]);

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFiltersChange({ ...filters, skills: newSkills });
  };

  const handlePriceChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    onFiltersChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({ ...filters, minRating: rating });
  };

  const handleAvailabilityToggle = () => {
    onFiltersChange({ ...filters, availableOnly: !filters.availableOnly });
  };

  const clearFilters = () => {
    setPriceRange([0, 500]);
    onFiltersChange({
      skills: [],
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
      availableOnly: false,
    });
  };

  const hasActiveFilters =
    filters.skills.length > 0 ||
    filters.minPrice > 0 ||
    filters.maxPrice < 500 ||
    filters.minRating > 0 ||
    filters.availableOnly;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6 sticky top-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Skills Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filters.skills.includes(skill)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Hourly Rate
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={priceRange[1]}
              onChange={(e) =>
                handlePriceChange(priceRange[0], Number(e.target.value))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) =>
                handlePriceChange(Number(e.target.value), priceRange[1])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Min"
            />
            <input
              type="number"
              min={priceRange[0]}
              max="500"
              value={priceRange[1]}
              onChange={(e) =>
                handlePriceChange(priceRange[0], Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Minimum Rating
        </label>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                filters.minRating === rating
                  ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">{rating}+ stars</span>
            </button>
          ))}
          {filters.minRating > 0 && (
            <button
              onClick={() => handleRatingChange(0)}
              className="w-full text-sm text-gray-600 hover:text-gray-900"
            >
              Clear rating filter
            </button>
          )}
        </div>
      </div>

      {/* Availability Toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700">
            Available Now
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={handleAvailabilityToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Show only mentors with availability in the next 7 days
        </p>
      </div>
    </div>
  );
}
