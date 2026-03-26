import React from 'react';

type MentorSearchFilters = {
  skills: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability: AvailabilityFilter;
  availabilityDays: string[];
  languages: string[];
  timezone?: string;
  verifiedOnly: boolean;
};

interface MentorFilterPanelProps {
  filters: MentorSearchFilters;
  onFilterChange: <K extends keyof MentorSearchFilters>(
    key: K,
    value: MentorSearchFilters[K]
  ) => void;
  onClearFilters: () => void;
}

const AVAILABLE_SKILLS = [
  'Stellar', 'React', 'Node.js', 'TypeScript', 'JavaScript', 
  'Python', 'Rust', 'Solidity', 'Soroban', 'Smart Contracts',
  'Web3', 'DeFi', 'NFTs', 'Blockchain', 'Figma', 'Design Systems'
];

const AVAILABLE_LANGUAGES = ['English', 'Spanish', 'Mandarin', 'Arabic', 'French', 'Portuguese', 'Korean'];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MentorFilterPanel: React.FC<MentorFilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = 
    filters.skills.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.availabilityDays.length > 0 ||
    filters.languages.length > 0;

  const toggleSkill = (skill: string) => {
    const updated = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange("skills", updated);
  };

  const toggleLanguage = (language: string) => {
    const updated = filters.languages.includes(language)
      ? filters.languages.filter((l) => l !== language)
      : [...filters.languages, language];
    onFilterChange("languages", updated);
  };

  const toggleDay = (day: string) => {
    const updated = filters.availabilityDays.includes(day)
      ? filters.availabilityDays.filter((d) => d !== day)
      : [...filters.availabilityDays, day];
    onFilterChange("availabilityDays", updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-bold text-stellar hover:text-stellar-dark underline underline-offset-4"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Skills & Expertise
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SKILLS.map((skill) => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.skills.includes(skill)
                    ? 'bg-stellar text-white shadow-md shadow-stellar/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Hourly Rate (XLM)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={filters.minPrice || ""}
              onChange={(e) =>
                onFilterChange("minPrice", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Min"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                onFilterChange("maxPrice", e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="Max"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Minimum Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  onFilterChange("minRating", filters.minRating === rating ? undefined : rating)
                }
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  filters.minRating === rating
                    ? 'bg-yellow-400 text-white shadow-md'
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Availability
          </label>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onFilterChange("availability", "all")}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                filters.availability === "all"
                  ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              Any time
            </button>
            <button
              onClick={() => onFilterChange("availability", "today")}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                filters.availability === "today"
                  ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              Available today
            </button>
            <button
              onClick={() => onFilterChange("availability", "this_week")}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${
                filters.availability === "this_week"
                  ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
              }`}
            >
              Available this week
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Available Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.availabilityDays.includes(day)
                    ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((language) => (
              <button
                key={language}
                onClick={() => toggleLanguage(language)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.languages.includes(language)
                    ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Timezone
          </label>
          <select
            value={filters.timezone || ""}
            onChange={(e) => onFilterChange("timezone", e.target.value || undefined)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all cursor-pointer"
          >
            <option value="">Any timezone</option>
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> Verification
          </label>
          <button
            onClick={() => onFilterChange("verifiedOnly", !filters.verifiedOnly)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              filters.verifiedOnly
                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Verified only
            </span>
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-6 w-full py-2.5 text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors border-t border-gray-100 pt-4 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );
};

export default MentorFilterPanel;
