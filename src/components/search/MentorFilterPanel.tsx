import React from "react";
import { Calendar, Globe, Award, X } from "lucide-react";
import {
  TIMEZONES,
  AVAILABLE_LANGUAGES,
  AVAILABLE_SKILLS,
} from "../../utils/search.utils";

export type AvailabilityFilter = "all" | "today" | "this_week";

interface MentorFilterPanelProps {
  filters: {
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
  onFilterChange: (key: string, value: unknown) => void;
  onClearFilters: () => void;
  activeFilterCount?: number;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MentorFilterPanel: React.FC<MentorFilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount = 0,
}) => {
  const hasActiveFilters =
    filters.skills.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.availability !== "all" ||
    filters.availabilityDays.length > 0 ||
    filters.languages.length > 0 ||
    filters.timezone !== undefined ||
    filters.verifiedOnly;

  const toggleSkill = (skill: string) => {
    const current = filters.skills;
    const updated = current.includes(skill)
      ? current.filter((s: string) => s !== skill)
      : [...current, skill];
    onFilterChange("skills", updated);
  };

  const toggleLanguage = (language: string) => {
    const current = filters.languages;
    const updated = current.includes(language)
      ? current.filter((l: string) => l !== language)
      : [...current, language];
    onFilterChange("languages", updated);
  };

  const toggleDay = (day: string) => {
    const current = filters.availabilityDays;
    const updated = current.includes(day)
      ? current.filter((d: string) => d !== day)
      : [...current, day];
    onFilterChange("availabilityDays", updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="bg-stellar text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-bold text-stellar hover:text-stellar-dark underline underline-offset-4 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Skills Filter */}
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
                    ? "bg-stellar text-white shadow-md shadow-stellar/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Hourly Rate (XLM)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={filters.minPrice || ""}
              onChange={(e) =>
                onFilterChange(
                  "minPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Min"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              value={filters.maxPrice || ""}
              onChange={(e) =>
                onFilterChange(
                  "maxPrice",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              placeholder="Max"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all"
            />
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Minimum Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  onFilterChange(
                    "minRating",
                    filters.minRating === rating ? undefined : rating,
                  )
                }
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  filters.minRating === rating
                    ? "bg-yellow-400 text-white shadow-md"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {rating}★
              </button>
            ))}
          </div>
        </div>

        {/* Availability Quick Filter */}
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

        {/* Specific Days Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Specific Days
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.availabilityDays.includes(day)
                    ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Languages Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Languages
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_LANGUAGES.map((language) => (
              <button
                key={language}
                onClick={() => toggleLanguage(language)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filters.languages.includes(language)
                    ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Timezone
          </label>
          <select
            value={filters.timezone || ""}
            onChange={(e) =>
              onFilterChange("timezone", e.target.value || undefined)
            }
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

        {/* Verified Only Toggle */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" /> Verification
          </label>
          <button
            onClick={() =>
              onFilterChange("verifiedOnly", !filters.verifiedOnly)
            }
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
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center ${
                filters.verifiedOnly ? "bg-white/20" : "bg-gray-200"
              }`}
            >
              {filters.verifiedOnly && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Clear Filters Button */}
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
