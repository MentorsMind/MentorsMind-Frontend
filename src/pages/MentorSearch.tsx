import React, { useState } from 'react';
import { useMentorSearch } from '../hooks/useMentorSearch';
import MentorSearchBar from '../components/search/MentorSearchBar';
import MentorFilterPanel from '../components/search/MentorFilterPanel';
import SearchSortOptions from '../components/search/SearchSortOptions';
import MentorGrid from '../components/search/MentorGrid';
import MentorCard from '../components/search/MentorCard';
import BookingModal from '../components/learner/BookingModal';
import type { MentorProfile } from '../types';

const MentorSearch: React.FC<{ isOnline?: boolean }> = ({ isOnline = true }) => {
  const {
    mentors,
    totalResults,
    currentPage,
    totalPages,
    hasMore,
    filters,
    updateFilter,
    clearFilters,
    nextPage,
    prevPage,
    goToPage,
    getSuggestions,
    toggleSaveMentor,
    isSaved,
    addRecentlyViewed,
    getRecommendations,
    getRecentlyViewedMentors,
  } = useMentorSearch();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);

  const handleSearch = (query: string) => {
    updateFilter('searchQuery', query);
  };

  const handleViewProfile = (mentor: MentorProfile) => {
    addRecentlyViewed(mentor.id);
    // In a real app, this would navigate to the mentor's profile page
    alert(`Viewing profile of ${mentor.name}`);
  };

  const suggestions = getSuggestions(searchQuery);
  const recommendations = getRecommendations();
  const recentlyViewed = getRecentlyViewedMentors();

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
          suggestions={suggestions}
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

        {/* Main Content - Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sort & View Options */}
          <SearchSortOptions
            sortBy={filters.sortBy}
            onSortChange={(sort) => updateFilter('sortBy', sort)}
            resultsCount={totalResults}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Mentor Grid/List */}
          <MentorGrid
            mentors={mentors}
            savedMentors={new Set(mentors.filter((mentor) => isSaved(mentor.id)).map((mentor) => mentor.id))}
            onSaveToggle={toggleSaveMentor}
            onViewProfile={handleViewProfile}
            onBookSession={isOnline ? setSelectedMentor : undefined}
            viewMode={viewMode}
          />


          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                    currentPage === page
                      ? 'bg-stellar text-white shadow-lg shadow-stellar/20'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={!hasMore}
                className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Section */}
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
                  <div className="w-16 h-16 rounded-xl bg-linear-to-br from-stellar to-blue-600 flex items-center justify-center text-white font-bold text-xl">
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

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended For You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                isSaved={isSaved(mentor.id)}
                onSave={toggleSaveMentor}
                onViewProfile={handleViewProfile}
                onBookSession={isOnline ? setSelectedMentor : undefined}
                viewMode="grid"
              />
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
