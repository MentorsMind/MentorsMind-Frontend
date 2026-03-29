import React, { useState } from 'react';
import { useMentorList } from '../hooks/queries/useMentors';
import MentorSearchBar from '../components/search/MentorSearchBar';
import MentorFilterPanel from '../components/search/MentorFilterPanel';
import SearchSortOptions from '../components/search/SearchSortOptions';
import MentorGrid from '../components/search/MentorGrid';
import MentorCard from '../components/search/MentorCard';
import BookingModal from '../components/learner/BookingModal';
import type { MentorProfile } from '../types';

// ─── Local filter state ──────────────────────────────────────────────────────

type Filters = {
  searchQuery: string;
  skills: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availabilityDays: string[];
  languages: string[];
  sortBy: string;
};

const defaultFilters: Filters = {
  searchQuery: '',
  skills: [],
  availabilityDays: [],
  languages: [],
  sortBy: 'rating',
};

// ─── Component ───────────────────────────────────────────────────────────────

const MentorSearch: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [savedMentorIds, setSavedMentorIds] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<MentorProfile[]>([]);

  // ─── Real data fetch ─────────────────────────────────────────────────────

  const { data, isLoading, isError, isFetching } = useMentorList({
    page,
    limit: 12,
    search: filters.searchQuery || undefined,
    sortBy: filters.sortBy,
    skills: filters.skills.join(',') || undefined,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    languages: filters.languages.join(',') || undefined,
  });

  const mentors = data?.data ?? [];
  const totalResults = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasMore = page < totalPages;

  // ─── Handlers ────────────────────────────────────────────────────────────

  const updateFilter = (key: keyof Filters, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const handleSearch = (query: string) => updateFilter('searchQuery', query);

  const toggleSaveMentor = (id: string) => {
    setSavedMentorIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleViewProfile = (mentor: MentorProfile) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((m) => m.id !== mentor.id);
      return [mentor, ...filtered].slice(0, 6);
    });
    // TODO: navigate to /mentors/:id
    alert(`Viewing profile of ${mentor.name}`);
  };

  // ─── Loading / Error states ────────────────────────────────────────────

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Failed to load mentors. Please try again.</p>
        <button
          onClick={() => setPage(1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          Find Your Perfect <span className="text-stellar">Mentor</span>
        </h1>
        <p className="text-gray-500 font-medium">
          Discover expert mentors ready to help you grow your skills.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <MentorSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          suggestions={[]}
          placeholder="Search by name, skill (e.g., Stellar, React), or expertise..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <div className="lg:col-span-1">
          <MentorFilterPanel
            filters={{
              skills: filters.skills,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
              minRating: filters.minRating,
              availabilityDays: filters.availabilityDays,
              languages: filters.languages,
            }}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <SearchSortOptions
            sortBy={filters.sortBy}
            onSortChange={(sort) => updateFilter('sortBy', sort)}
            resultsCount={totalResults}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Stale overlay while fetching next page / filter change */}
          <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''}>
            <MentorGrid
              mentors={mentors}
              savedMentors={savedMentorIds}
              onSaveToggle={toggleSaveMentor}
              onViewProfile={handleViewProfile}
              onBookSession={isOnline ? setSelectedMentor : undefined}
              viewMode={viewMode}
              isLoading={isLoading}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    page === p
                      ? 'bg-stellar text-white shadow-lg shadow-stellar/20'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed Mentors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlyViewed.map((mentor) => (
              <div
                key={mentor.id}
                onClick={() => handleViewProfile(mentor)}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-lg hover:border-stellar/20 transition-all cursor-pointer flex items-center gap-4"
              >
                {mentor.avatar ? (
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-stellar to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {mentor.name[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{mentor.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{mentor.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-bold text-gray-900">{mentor.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BookingModal
        isOpen={selectedMentor !== null}
        mentor={selectedMentor}
        onClose={() => setSelectedMentor(null)}
      />
    </div>
  );
};

export default MentorSearch;
