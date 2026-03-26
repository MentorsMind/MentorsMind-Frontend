import { useState, useCallback, useMemo } from 'react';
import type { MentorProfile, SearchFilters, SearchResult } from '../types';

// Mock mentor data for demonstration
const MOCK_MENTORS: MentorProfile[] = [
  {
    id: 'm1',
    name: 'Dr. Sarah Chen',
    title: 'Senior Blockchain Developer',
    bio: 'Passionate about Stellar ecosystem development with 8+ years of experience in blockchain technology.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    hourlyRate: 85,
    currency: 'XLM',
    rating: 4.9,
    reviewCount: 127,
    totalSessions: 342,
    completionRate: 98,
    skills: ['Stellar', 'Soroban', 'Smart Contracts', 'Web3', 'Rust'],
    expertise: ['Blockchain', 'DeFi', 'NFTs'],
    languages: ['English', 'Mandarin'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday'],
      timeSlots: ['9:00-12:00', '14:00-17:00'],
      timezone: 'UTC-5',
    },
    experienceYears: 8,
    certifications: ['Certified Stellar Developer', 'AWS Solutions Architect'],
    isAvailable: true,
    responseTime: 'Within 1 hour',
    joinedDate: '2023-01-15',
  },
  {
    id: 'm2',
    name: 'Marcus Johnson',
    title: 'Full Stack Developer & Mentor',
    bio: 'Specializing in React, Node.js, and Stellar payment integrations. Love helping developers grow.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    hourlyRate: 65,
    currency: 'XLM',
    rating: 4.8,
    reviewCount: 89,
    totalSessions: 215,
    completionRate: 96,
    skills: ['React', 'Node.js', 'TypeScript', 'Stellar SDK', 'JavaScript'],
    expertise: ['Web Development', 'Payment Systems'],
    languages: ['English', 'Spanish'],
    availability: {
      days: ['Tuesday', 'Thursday', 'Saturday'],
      timeSlots: ['10:00-13:00', '15:00-18:00'],
      timezone: 'UTC-8',
    },
    experienceYears: 6,
    certifications: ['Meta Certified Developer'],
    isAvailable: true,
    responseTime: 'Within 2 hours',
    joinedDate: '2023-03-22',
  },
  {
    id: 'm3',
    name: 'Emily Rodriguez',
    title: 'UX/UI Designer & Frontend Expert',
    bio: 'Creating beautiful and intuitive interfaces for blockchain applications. Design mentor with a tech background.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    hourlyRate: 70,
    currency: 'XLM',
    rating: 4.9,
    reviewCount: 156,
    totalSessions: 428,
    completionRate: 99,
    skills: ['Figma', 'React', 'Design Systems', 'Prototyping', 'CSS'],
    expertise: ['UI/UX Design', 'Frontend Development'],
    languages: ['English', 'Portuguese'],
    availability: {
      days: ['Monday', 'Tuesday', 'Thursday'],
      timeSlots: ['8:00-12:00', '13:00-16:00'],
      timezone: 'UTC-3',
    },
    experienceYears: 7,
    certifications: ['Google UX Design Certificate'],
    isAvailable: false,
    responseTime: 'Within 4 hours',
    joinedDate: '2022-11-08',
  },
  {
    id: 'm4',
    name: 'Prof. Ahmed Hassan',
    title: 'Cryptography & Security Expert',
    bio: 'University professor and security researcher. Specialized in cryptographic protocols and blockchain security.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
    hourlyRate: 95,
    currency: 'XLM',
    rating: 5.0,
    reviewCount: 73,
    totalSessions: 189,
    completionRate: 100,
    skills: ['Cryptography', 'Security Auditing', 'Solidity', 'Rust', 'Formal Verification'],
    expertise: ['Blockchain Security', 'Smart Contract Auditing'],
    languages: ['English', 'Arabic', 'French'],
    availability: {
      days: ['Wednesday', 'Friday'],
      timeSlots: ['14:00-18:00'],
      timezone: 'UTC+1',
    },
    experienceYears: 12,
    certifications: ['Certified Information Systems Security Professional', 'Ethereum Security Expert'],
    isAvailable: true,
    responseTime: 'Within 30 minutes',
    joinedDate: '2023-02-10',
  },
  {
    id: 'm5',
    name: 'Lisa Park',
    title: 'DeFi Protocol Developer',
    bio: 'Built multiple DeFi protocols on Stellar. Passionate about decentralized finance and financial inclusion.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    hourlyRate: 80,
    currency: 'XLM',
    rating: 4.7,
    reviewCount: 64,
    totalSessions: 156,
    completionRate: 95,
    skills: ['DeFi', 'Solidity', 'Web3.py', 'Python', 'Financial Modeling'],
    expertise: ['DeFi Protocols', 'Tokenomics', 'Yield Farming'],
    languages: ['English', 'Korean'],
    availability: {
      days: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      timeSlots: ['11:00-15:00', '19:00-22:00'],
      timezone: 'UTC+9',
    },
    experienceYears: 5,
    certifications: ['Certified DeFi Expert'],
    isAvailable: true,
    responseTime: 'Within 3 hours',
    joinedDate: '2023-06-01',
  },
];

const ITEMS_PER_PAGE = 2;

export const useMentorSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    skills: [],
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined,
    availabilityDays: [],
    languages: [],
    sortBy: 'rating',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [savedMentors, setSavedMentors] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  // Filter and sort mentors based on current filters
  const filteredMentors = useMemo(() => {
    let result = [...MOCK_MENTORS];

    // Search query filter (name, title, bio, skills)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(query) ||
          mentor.title.toLowerCase().includes(query) ||
          mentor.bio.toLowerCase().includes(query) ||
          mentor.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          mentor.expertise.some((exp) => exp.toLowerCase().includes(query))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      result = result.filter((mentor) =>
        filters.skills.every((skill) =>
          mentor.skills.some((ms) => ms.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      result = result.filter((mentor) => mentor.hourlyRate >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((mentor) => mentor.hourlyRate <= filters.maxPrice!);
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      result = result.filter((mentor) => mentor.rating >= filters.minRating!);
    }

    // Availability filter
    if (filters.availabilityDays.length > 0) {
      result = result.filter((mentor) =>
        filters.availabilityDays.every((day) => mentor.availability.days.includes(day))
      );
    }

    // Language filter
    if (filters.languages.length > 0) {
      result = result.filter((mentor) =>
        filters.languages.every((lang) =>
          mentor.languages.some((ml) => ml.toLowerCase() === lang.toLowerCase())
        )
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price_low':
          return a.hourlyRate - b.hourlyRate;
        case 'price_high':
          return b.hourlyRate - a.hourlyRate;
        case 'experience':
          return b.experienceYears - a.experienceYears;
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        default:
          return 0;
      }
    });

    return result;
  }, [filters]);

  // Pagination
  const totalPages = Math.ceil(filteredMentors.length / ITEMS_PER_PAGE);
  const paginatedMentors = filteredMentors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get autocomplete suggestions based on search query
  const getSuggestions = useCallback((query: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    const suggestions = new Set<string>();
    
    MOCK_MENTORS.forEach((mentor) => {
      if (mentor.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(mentor.name);
      }
      if (mentor.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(mentor.title);
      }
      mentor.skills.forEach((skill) => {
        if (skill.toLowerCase().includes(lowerQuery)) {
          suggestions.add(skill);
        }
      });
      mentor.expertise.forEach((exp) => {
        if (exp.toLowerCase().includes(lowerQuery)) {
          suggestions.add(exp);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 5);
  }, []);

  // Add mentor to recently viewed
  const addRecentlyViewed = useCallback((mentorId: string) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((id) => id !== mentorId);
      return [mentorId, ...updated].slice(0, 5); // Keep last 5 viewed
    });
  }, []);

  // Toggle saved mentor
  const toggleSaveMentor = useCallback((mentorId: string) => {
    setSavedMentors((prev) => {
      const updated = new Set(prev);
      if (updated.has(mentorId)) {
        updated.delete(mentorId);
      } else {
        updated.add(mentorId);
      }
      return updated;
    });
  }, []);

  // Update filter
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      skills: [],
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      availabilityDays: [],
      languages: [],
      sortBy: 'rating',
    });
    setCurrentPage(1);
  }, []);

  // Get mentor by ID
  const getMentorById = useCallback((id: string): MentorProfile | undefined => {
    return MOCK_MENTORS.find((m) => m.id === id);
  }, []);

  // Get recently viewed mentors
  const getRecentlyViewedMentors = useCallback((): MentorProfile[] => {
    return recentlyViewed.map((id) => MOCK_MENTORS.find((m) => m.id === id)).filter(Boolean) as MentorProfile[];
  }, [recentlyViewed]);

  // Get personalized recommendations (based on saved mentors and viewing history)
  const getRecommendations = useCallback((): MentorProfile[] => {
    // Simple recommendation logic: similar skills to saved/viewed mentors
    const viewedMentors = getRecentlyViewedMentors();
    const savedMentorProfiles = Array.from(savedMentors)
      .map((id) => MOCK_MENTORS.find((m) => m.id === id))
      .filter(Boolean) as MentorProfile[];
    
    const allConsideredMentors = [...viewedMentors, ...savedMentorProfiles];
    
    if (allConsideredMentors.length === 0) {
      // Return top-rated mentors if no history
      return MOCK_MENTORS.slice().sort((a, b) => b.rating - a.rating).slice(0, 3);
    }
    
    // Collect preferred skills
    const skillFrequency = new Map<string, number>();
    allConsideredMentors.forEach((mentor) => {
      mentor.skills.forEach((skill) => {
        skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
      });
    });
    
    // Find mentors with matching skills (excluding already viewed/saved)
    const consideredIds = new Set([...recentlyViewed, ...savedMentors]);
    const recommendations = MOCK_MENTORS
      .filter((m) => !consideredIds.has(m.id))
      .filter((m) => m.skills.some((skill) => skillFrequency.has(skill)))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    
    return recommendations;
  }, [recentlyViewed, savedMentors, getRecentlyViewedMentors]);

  return {
    mentors: paginatedMentors,
    totalResults: filteredMentors.length,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
    filters,
    updateFilter,
    clearFilters,
    nextPage: () => setCurrentPage((p) => Math.min(p + 1, totalPages)),
    prevPage: () => setCurrentPage((p) => Math.max(p - 1, 1)),
    goToPage: (page: number) => setCurrentPage(page),
    getSuggestions,
    toggleSaveMentor,
    isSaved: (mentorId: string) => savedMentors.has(mentorId),
    addRecentlyViewed,
    getRecentlyViewedMentors,
    getRecommendations,
    getMentorById,
    loading: false,
  };
};
