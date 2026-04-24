import { useState, useEffect, useMemo } from 'react';
import MentorCard from '../components/mentor/MentorCard';
import { TimeZoneFilter } from '../components/mentor/filters/TimeZoneFilter';
import { MentorMapView } from '../components/mentor/MentorMapView';
import PaymentModal from '../components/payment/PaymentModal';
import Input from '../components/ui/Input';
import { SkeletonCard } from '../components/animations/SkeletonLoader';
import { useMinimumLoading } from '../hooks/useMinimumLoading';
import { timezoneService } from '../services/timezone.service';
import { isMentorAvailableNow, parseTimezoneOffset } from '../utils/timezone.utils';
import type { Mentor } from '../types';
import type { TimezoneProximityFilter } from '../types/timezone.types';

// Mock data
const MOCK_MENTORS: Mentor[] = [
  { id: '1', email: 'alice@example.com', name: 'Alice Chen', role: 'mentor', bio: 'Senior Rust & Blockchain engineer with 8 years experience. Soroban smart contract specialist.', skills: ['Rust', 'Soroban', 'Stellar', 'WebAssembly'], hourlyRate: 120, currency: 'USDC', rating: 4.9, reviewCount: 87, sessionCount: 312, isVerified: true, timezone: 'America/Los_Angeles', languages: ['English', 'Mandarin'], createdAt: '' },
  { id: '2', email: 'bob@example.com', name: 'Bob Martinez', role: 'mentor', bio: 'Full-stack developer specializing in React, TypeScript, and Node.js. 6 years building production apps.', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], hourlyRate: 90, currency: 'XLM', rating: 4.7, reviewCount: 54, sessionCount: 198, isVerified: true, timezone: 'America/New_York', languages: ['English', 'Spanish'], createdAt: '' },
  { id: '3', email: 'priya@example.com', name: 'Priya Sharma', role: 'mentor', bio: 'Machine learning engineer at a top AI lab. Expert in Python, TensorFlow, and data science.', skills: ['Python', 'TensorFlow', 'ML', 'Data Science'], hourlyRate: 150, currency: 'USDC', rating: 5.0, reviewCount: 32, sessionCount: 145, isVerified: true, timezone: 'Asia/Kolkata', languages: ['English', 'Hindi'], createdAt: '' },
  { id: '4', email: 'james@example.com', name: 'James Okafor', role: 'mentor', bio: 'DevOps and cloud architect. AWS certified. Kubernetes, Docker, and CI/CD expert.', skills: ['AWS', 'Kubernetes', 'Docker', 'DevOps'], hourlyRate: 110, currency: 'USDC', rating: 4.8, reviewCount: 61, sessionCount: 220, isVerified: false, timezone: 'Europe/Paris', languages: ['English'], createdAt: '' },
  { id: '5', email: 'yuki@example.com', name: 'Yuki Tanaka', role: 'mentor', bio: 'Smart contract auditor and DeFi protocol developer. 5 years in the Stellar ecosystem.', skills: ['Soroban', 'Rust', 'DeFi', 'Security Auditing'], hourlyRate: 130, currency: 'XLM', rating: 4.6, reviewCount: 28, sessionCount: 89, isVerified: true, timezone: 'Asia/Tokyo', languages: ['English', 'Japanese'], createdAt: '' },
  { id: '6', email: 'fatima@example.com', name: 'Fatima Al-Hassan', role: 'mentor', bio: 'Cryptography researcher and blockchain security expert. PhD in Computer Science.', skills: ['Cryptography', 'Security Auditing', 'Rust', 'Stellar'], hourlyRate: 140, currency: 'USDC', rating: 4.9, reviewCount: 41, sessionCount: 167, isVerified: true, timezone: 'Africa/Cairo', languages: ['English', 'Arabic'], createdAt: '' },
];

// Availability slots per mentor (realistic working hours in their timezone)
const MENTOR_AVAILABILITY: Record<string, { dayOfWeek: number; startHour: number; endHour: number }[]> = {
  '1': [1,2,3,4,5].map(d => ({ dayOfWeek: d, startHour: 9, endHour: 18 })),
  '2': [1,2,3,4,5].map(d => ({ dayOfWeek: d, startHour: 10, endHour: 19 })),
  '3': [1,3,5].map(d => ({ dayOfWeek: d, startHour: 10, endHour: 20 })),
  '4': [2,4].map(d => ({ dayOfWeek: d, startHour: 14, endHour: 22 })),
  '5': [1,2,3,4,5].map(d => ({ dayOfWeek: d, startHour: 9, endHour: 17 })),
  '6': [0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, startHour: 8, endHour: 20 })),
};

const ALL_SKILLS = ['Rust', 'React', 'TypeScript', 'Python', 'Soroban', 'Stellar', 'Node.js', 'AWS', 'ML', 'Docker'];

export default function MentorSearch() {
  const [query, setQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'timezone'>('rating');
  const [timezoneFilter, setTimezoneFilter] = useState<TimezoneProximityFilter>({
    selectedRegions: [],
    similarToMine: false,
    availableNow: false,
  });
  const [showMapView, setShowMapView] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const showSkeleton = useMinimumLoading(isLoading, 300);

  const toggleSkill = (s: string) =>
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const filtered = useMemo(() => {
    let result = MOCK_MENTORS.filter(m => {
      const matchQuery = !query || m.name.toLowerCase().includes(query.toLowerCase()) || m.skills.some(s => s.toLowerCase().includes(query.toLowerCase()));
      const matchSkills = selectedSkills.length === 0 || selectedSkills.every(s => m.skills.includes(s));
      const matchPrice = !maxPrice || m.hourlyRate <= Number(maxPrice);
      return matchQuery && matchSkills && matchPrice;
    });

    // Similar to mine: ±3 hours
    if (timezoneFilter.similarToMine) {
      result = timezoneService.getNearbyMentors(result, 3);
    }

    // Available now: cross-reference current time against availability slots
    if (timezoneFilter.availableNow) {
      result = result.filter(m => {
        const slots = MENTOR_AVAILABILITY[m.id] ?? [];
        return isMentorAvailableNow(m.timezone, slots);
      });
    }

    // Region filter
    if (timezoneFilter.selectedRegions.length > 0) {
      result = result.filter(m => {
        const region = m.timezone.split('/')[0];
        return timezoneFilter.selectedRegions.some(r => {
          if (r === 'Americas') return m.timezone.startsWith('America');
          if (r === 'Europe') return m.timezone.startsWith('Europe');
          if (r === 'Africa') return m.timezone.startsWith('Africa');
          if (r === 'Asia/Pacific') return m.timezone.startsWith('Asia') || m.timezone.startsWith('Australia') || m.timezone.startsWith('Pacific');
          return false;
        });
      });
    }

    // Specific timezone filter
    if (timezoneFilter.selectedTimezone) {
      const targetOffset = parseTimezoneOffset(timezoneFilter.selectedTimezone);
      result = result.filter(m => Math.abs(parseTimezoneOffset(m.timezone) - targetOffset) < 0.5);
    }

    // Sorting
    if (sortBy === 'timezone') {
      result = timezoneService.sortByClosestTimezone(result);
    } else if (sortBy === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price') {
      result = [...result].sort((a, b) => a.hourlyRate - b.hourlyRate);
    }

    return result;
  }, [query, selectedSkills, maxPrice, timezoneFilter, sortBy]);

  // Compute isAvailableNow per mentor for card display
  const availabilityMap = useMemo(() =>
    Object.fromEntries(
      MOCK_MENTORS.map(m => [m.id, isMentorAvailableNow(m.timezone, MENTOR_AVAILABILITY[m.id] ?? [])])
    ), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Find a Mentor</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search by name or skill..." value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <Input placeholder="Max price (per hour)" type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="md:w-48" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {ALL_SKILLS.map(s => (
              <button key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors
                  ${selectedSkills.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar + Results Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <TimeZoneFilter
              onFilterChange={setTimezoneFilter}
              userTimezone={timezoneService.getUserTimezone()}
            />
          </div>

          {/* Main Results Area */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                {showSkeleton ? 'Searching for mentors...' : `${filtered.length} mentor${filtered.length !== 1 ? 's' : ''} found`}
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as 'rating' | 'price' | 'timezone')}
                  title="Sort mentors by"
                  aria-label="Sort mentors by"
                  className="text-sm px-3 py-2 rounded border border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                >
                  <option value="rating">Sort by: Rating</option>
                  <option value="price">Sort by: Price (Low to High)</option>
                  <option value="timezone">Sort by: Closest Timezone</option>
                </select>
                <button
                  onClick={() => setShowMapView(!showMapView)}
                  className={`px-4 py-2 rounded text-sm font-medium transition ${
                    showMapView
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showMapView ? 'List View' : 'Map View'}
                </button>
              </div>
            </div>

            {/* Map View or List View */}
            {showMapView ? (
              <MentorMapView
                mentors={filtered}
                onMentorSelect={setBookingMentor}
              />
            ) : (
              <>
                {showSkeleton ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} variant="mentor" />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="text-lg font-medium">No mentors found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(m => (
                      <MentorCard
                        key={m.id}
                        mentor={m}
                        isAvailableNow={availabilityMap[m.id]}
                        onBook={setBookingMentor}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {bookingMentor && (
        <PaymentModal isOpen={!!bookingMentor} onClose={() => setBookingMentor(null)} mentor={bookingMentor} sessionDuration={60} />
      )}
    </div>
  );
}
