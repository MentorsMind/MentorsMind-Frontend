import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMentorSearch } from '../hooks/useMentorSearch';

describe('useMentorSearch Hook', () => {
  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    expect(result.current.filters).toEqual({
      searchQuery: '',
      skills: [],
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      availabilityDays: [],
      languages: [],
      sortBy: 'rating',
    });
  });

  it('should return mentors based on filters', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    expect(result.current.mentors).toBeDefined();
    expect(result.current.totalResults).toBeGreaterThan(0);
  });

  it('should filter mentors by search query', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.updateFilter('searchQuery', 'Stellar');
    });
    
    expect(result.current.totalResults).toBeLessThan(5); // Should filter to Stellar experts
  });

  it('should filter mentors by minimum rating', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.updateFilter('minRating', 5);
    });
    
    // All returned mentors should have rating >= 5
    result.current.mentors.forEach((mentor) => {
      expect(mentor.rating).toBeGreaterThanOrEqual(5);
    });
  });

  it('should sort mentors by rating', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.updateFilter('sortBy', 'rating');
    });
    
    const mentors = result.current.mentors;
    for (let i = 1; i < mentors.length; i++) {
      expect(mentors[i - 1].rating).toBeGreaterThanOrEqual(mentors[i].rating);
    }
  });

  it('should sort mentors by price (low to high)', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.updateFilter('sortBy', 'price_low');
    });
    
    const mentors = result.current.mentors;
    for (let i = 1; i < mentors.length; i++) {
      expect(mentors[i - 1].hourlyRate).toBeLessThanOrEqual(mentors[i].hourlyRate);
    }
  });

  it('should toggle save mentor', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    const mentorId = 'm1';
    expect(result.current.isSaved(mentorId)).toBe(false);
    
    act(() => {
      result.current.toggleSaveMentor(mentorId);
    });
    
    expect(result.current.isSaved(mentorId)).toBe(true);
    
    act(() => {
      result.current.toggleSaveMentor(mentorId);
    });
    
    expect(result.current.isSaved(mentorId)).toBe(false);
  });

  it('should add mentor to recently viewed', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.addRecentlyViewed('m1');
      result.current.addRecentlyViewed('m2');
    });
    
    const recentlyViewed = result.current.getRecentlyViewedMentors();
    expect(recentlyViewed.length).toBeGreaterThan(0);
  });

  it('should provide autocomplete suggestions', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    const suggestions = result.current.getSuggestions('Ste');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  it('should clear all filters', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.updateFilter('minRating', 4);
      result.current.updateFilter('skills', ['React']);
    });
    
    expect(result.current.filters.minRating).toBe(4);
    
    act(() => {
      result.current.clearFilters();
    });
    
    expect(result.current.filters.minRating).toBeUndefined();
    expect(result.current.filters.skills).toEqual([]);
  });

  it('should paginate through results', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    expect(result.current.currentPage).toBe(1);
    
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current.currentPage).toBe(2);
    
    act(() => {
      result.current.prevPage();
    });
    
    expect(result.current.currentPage).toBe(1);
  });

  it('should get mentor by ID', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    const mentor = result.current.getMentorById('m1');
    expect(mentor).toBeDefined();
    expect(mentor?.id).toBe('m1');
  });

  it('should provide personalized recommendations', () => {
    const { result } = renderHook(() => useMentorSearch());
    
    act(() => {
      result.current.addRecentlyViewed('m1');
    });
    
    const recommendations = result.current.getRecommendations();
    expect(recommendations.length).toBeGreaterThan(0);
  });
});
