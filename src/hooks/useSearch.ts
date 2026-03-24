import { useState, useEffect, useCallback, useMemo } from 'react';
import { searchService } from '../services/search.service';
import type { 
  SearchOptions, 
  SearchResultItem, 
  SearchFilters, 
  PaginatedResult 
} from '../services/search.service';
import { debounce } from '../utils/search.utils';

export interface UseSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  sortBy: SearchOptions['sortBy'];
  setSortBy: (sortBy: SearchOptions['sortBy']) => void;
  results: PaginatedResult<SearchResultItem> | null;
  loading: boolean;
  error: string | null;
  suggestions: string[];
  history: string[];
  savedSearches: any[];
  saveCurrentSearch: (name: string) => void;
  setPage: (page: number) => void;
}

export const useSearch = (initialOptions?: Partial<SearchOptions>): UseSearchReturn => {
  const [query, setQuery] = useState(initialOptions?.query || '');
  const [filters, setFilters] = useState<SearchFilters>(initialOptions?.filters || {});
  const [sortBy, setSortBy] = useState<SearchOptions['sortBy']>(initialOptions?.sortBy || 'relevance');
  const [page, setPage] = useState(initialOptions?.page || 1);
  const [results, setResults] = useState<PaginatedResult<SearchResultItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(searchService.getHistory());
  const [savedSearches, setSavedSearches] = useState(searchService.getSavedSearches());

  const fetchResults = useCallback(async (options: SearchOptions) => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchService.search(options);
      setResults(result);
      setHistory(searchService.getHistory());
    } catch (err) {
      setError('Failed to fetch search results. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((options: SearchOptions) => fetchResults(options), 500),
    [fetchResults]
  );

  useEffect(() => {
    const options: SearchOptions = { query, filters, sortBy, page };
    // If it's just a page change or filter change, we might want to search immediately
    // or keep it debounced. Let's keep it debounced for simplicity.
    debouncedSearch(options);
  }, [query, filters, sortBy, page, debouncedSearch]);

  useEffect(() => {
    if (query.length > 1) {
      searchService.getSuggestions(query).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const saveCurrentSearch = (name: string) => {
    searchService.saveSearch(name, { query, filters, sortBy });
    setSavedSearches(searchService.getSavedSearches());
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    results,
    loading,
    error,
    suggestions,
    history,
    savedSearches,
    saveCurrentSearch,
    setPage,
  };
};
