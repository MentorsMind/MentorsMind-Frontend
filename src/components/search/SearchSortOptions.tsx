import React from "react";

type SortOption =
  | "rating"
  | "price_low"
  | "price_high"
  | "newest"
  | "experience"
  | "sessions";

interface SearchSortOptionsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  resultsCount: number;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const SearchSortOptions: React.FC<SearchSortOptionsProps> = ({
  sortBy,
  onSortChange,
  resultsCount,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      {/* Results Count */}
      <div className="text-sm font-bold text-gray-500">
        <span className="text-gray-900 font-black">{resultsCount}</span> mentors
        found
      </div>

      {/* Sort & View Controls */}
      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-stellar focus:ring-2 focus:ring-stellar/10 transition-all cursor-pointer"
          >
            <option value="rating">Highest Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="experience">Most Experienced</option>
            <option value="sessions">Most Sessions</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "grid"
                ? "bg-white text-stellar shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="Grid View"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-2 rounded-lg transition-all ${
              viewMode === "list"
                ? "bg-white text-stellar shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
            title="List View"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSortOptions;
