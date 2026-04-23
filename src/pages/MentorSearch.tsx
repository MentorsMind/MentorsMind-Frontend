import { useState, useEffect } from 'react';
import MentorCard from '../components/mentor/MentorCard';
import BookingModal from '../components/learner/BookingModal';
import MentorFilterSidebar, { type MentorFilters } from '../components/search/MentorFilterSidebar';
import MentorCardSkeleton from '../components/search/MentorCardSkeleton';
import Input from '../components/ui/Input';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import type { Mentor } from '../types';
import { searchMentors, type MentorSearchParams } from '../services/mentor.service';

const ALL_SKILLS = [
  'Rust',
  'React',
  'TypeScript',
  'Python',
  'Soroban',
  'Stellar',
  'Node.js',
  'AWS',
  'ML',
  'Docker',
  'Kubernetes',
  'PostgreSQL',
  'TensorFlow',
  'Data Science',
  'DevOps',
  'WebAssembly',
];

const ITEMS_PER_PAGE = 12;

export default function MentorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate API load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = useMinimumLoading(isLoading, 300);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const params: MentorSearchParams = {
        q: query || undefined,
        skills: filters.skills.length > 0 ? filters.skills.join(',') : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 500 ? filters.maxPrice : undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
        page,
        limit: ITEMS_PER_PAGE,
      };

      const result = await searchMentors(params);
      setMentors(result.mentors);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      setMentors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, filters, page]);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
    if (filters.minPrice > 0) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 500) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating > 0) params.set('minRating', filters.minRating.toString());
    if (filters.availableOnly) params.set('available', 'true');
    if (page > 1) params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  }, [query, filters, page, setSearchParams]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: MentorFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Mentor</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name or skill..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {showSkeleton ? 'Searching for mentors...' : `${filtered.length} mentor${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} variant="mentor" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No mentors found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(m => <MentorCard key={m.id} mentor={m} onBook={setBookingMentor} />)}
          </div>
        )}
      </div>

      {bookingMentor && (
        <BookingModal
          isOpen={!!bookingMentor}
          onClose={() => setBookingMentor(null)}
          mentor={bookingMentor as any}
        />
      )}
    </div>
  );
}
