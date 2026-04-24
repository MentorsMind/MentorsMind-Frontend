import { useState } from "react";
import { useMentorSearch } from "../hooks/useMentorSearch";
import MentorCard from "../components/mentor/MentorCard";
import BookingModal from "../components/learner/BookingModal";
import MentorFilterSidebar from "../components/search/MentorFilterSidebar";
import MentorCardSkeleton from "../components/search/MentorCardSkeleton";
import Input from "../components/ui/Input";
import type { Mentor } from "../types";

const SKELETON_COUNT = 6;

export default function MentorSearch() {
  const {
    mentors,
    loading,
    filters,
    updateFilter,
    clearFilters,
    currentPage,
    totalPages,
    countLabel,
    goToPage,
  } = useMentorSearch();

  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);

  const hasActiveFilters =
    filters.q ||
    filters.skills ||
    filters.minRate ||
    filters.maxRate ||
    filters.isAvailable ||
    filters.minRating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Mentor</h1>
          <Input
            placeholder="Search by name or skill..."
            value={filters.q}
            onChange={(e) => updateFilter("q", e.target.value)}
          />
        </div>
      </div>

      {/* Sidebar + Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <MentorFilterSidebar
              filters={{
                skills: filters.skills ? filters.skills.split(",") : [],
                minPrice: filters.minRate ? Number(filters.minRate) : 0,
                maxPrice: filters.maxRate ? Number(filters.maxRate) : 500,
                minRating: filters.minRating ? Number(filters.minRating) : 0,
                availableOnly: filters.isAvailable === "true",
              }}
              onChange={(f) => {
                updateFilter("skills", f.skills.join(","));
                updateFilter("minRate", f.minPrice > 0 ? String(f.minPrice) : "");
                updateFilter("maxRate", f.maxPrice < 500 ? String(f.maxPrice) : "");
                updateFilter("minRating", f.minRating > 0 ? String(f.minRating) : "");
                updateFilter("isAvailable", f.availableOnly ? "true" : "");
              }}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Controls bar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                {loading ? "Searching for mentors…" : countLabel}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Skeleton / results / empty */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <MentorCardSkeleton key={i} />
                ))}
              </div>
            ) : mentors.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium">No mentors found</p>
                <p className="text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mentors.map((m) => (
                    <MentorCard key={m.id} mentor={m} onBook={setBookingMentor} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => goToPage(currentPage - 1)}
                      className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1 rounded border ${
                          p === currentPage
                            ? "bg-blue-600 text-white border-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => goToPage(currentPage + 1)}
                      className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {bookingMentor && (
        <BookingModal
          isOpen
          onClose={() => setBookingMentor(null)}
          mentor={bookingMentor as any}
        />
      )}
    </div>
  );
}
