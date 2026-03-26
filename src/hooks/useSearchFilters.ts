import { useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

// Types for filter state
export type AvailabilityFilter = "all" | "today" | "this_week";

export type SortOption = "rating" | "price_low" | "price_high" | "newest";

export type ViewMode = "grid" | "list";

export interface SearchFiltersState {
  searchQuery: string;
  skills: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability: AvailabilityFilter;
  availabilityDays: string[];
  languages: string[];
  timezone?: string;
  verifiedOnly: boolean;
  sortBy: SortOption;
}

// Filter preset definitions
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: Partial<SearchFiltersState>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "budget_friendly",
    name: "Budget-friendly",
    description: "Affordable mentors under 50 XLM/hr",
    icon: "💰",
    filters: { maxPrice: 50, sortBy: "price_low" },
  },
  {
    id: "top_rated",
    name: "Top Rated",
    description: "4.8+ rating with most reviews",
    icon: "⭐",
    filters: { minRating: 4.8, sortBy: "rating" },
  },
  {
    id: "available_now",
    name: "Available Now",
    description: "Available today or this week",
    icon: "✅",
    filters: { availability: "this_week" },
  },
  {
    id: "expert",
    name: "Expert",
    description: "5+ years of experience",
    icon: "🎓",
    filters: { minRating: 4.5 },
  },
];

// Default filter state
const DEFAULT_FILTERS: SearchFiltersState = {
  searchQuery: "",
  skills: [],
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  availability: "all",
  availabilityDays: [],
  languages: [],
  timezone: undefined,
  verifiedOnly: false,
  sortBy: "rating",
};

// LocalStorage key for view mode preference
const VIEW_MODE_KEY = "mentor_search_view_mode";

// URL parameter mapping
const FILTER_TO_URL_PARAMS: Record<keyof SearchFiltersState, string> = {
  searchQuery: "q",
  skills: "skills",
  minPrice: "min_price",
  maxPrice: "max_price",
  minRating: "min_rating",
  availability: "availability",
  availabilityDays: "days",
  languages: "languages",
  timezone: "timezone",
  verifiedOnly: "verified",
  sortBy: "sort",
};

export const useSearchFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load view mode from localStorage
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      if (saved === "grid" || saved === "list") return saved;
    }
    return "grid";
  });

  // Parse URL params into filter state
  const filtersFromUrl = useMemo((): SearchFiltersState => {
    const filters: SearchFiltersState = { ...DEFAULT_FILTERS };

    // Parse search query
    const q = searchParams.get(FILTER_TO_URL_PARAMS.searchQuery);
    if (q) filters.searchQuery = q;

    // Parse skills (comma-separated)
    const skills = searchParams.get(FILTER_TO_URL_PARAMS.skills);
    if (skills) filters.skills = skills.split(",").filter(Boolean);

    // Parse price range
    const minPrice = searchParams.get(FILTER_TO_URL_PARAMS.minPrice);
    if (minPrice) filters.minPrice = parseInt(minPrice, 10);

    const maxPrice = searchParams.get(FILTER_TO_URL_PARAMS.maxPrice);
    if (maxPrice) filters.maxPrice = parseInt(maxPrice, 10);

    // Parse rating
    const minRating = searchParams.get(FILTER_TO_URL_PARAMS.minRating);
    if (minRating) filters.minRating = parseFloat(minRating);

    // Parse availability
    const availability = searchParams.get(FILTER_TO_URL_PARAMS.availability);
    if (availability && ["all", "today", "this_week"].includes(availability)) {
      filters.availability = availability as AvailabilityFilter;
    }

    // Parse availability days
    const days = searchParams.get(FILTER_TO_URL_PARAMS.availabilityDays);
    if (days) filters.availabilityDays = days.split(",").filter(Boolean);

    // Parse languages
    const languages = searchParams.get(FILTER_TO_URL_PARAMS.languages);
    if (languages) filters.languages = languages.split(",").filter(Boolean);

    // Parse timezone
    const timezone = searchParams.get(FILTER_TO_URL_PARAMS.timezone);
    if (timezone) filters.timezone = timezone;

    // Parse verified only
    const verified = searchParams.get(FILTER_TO_URL_PARAMS.verifiedOnly);
    if (verified === "true") filters.verifiedOnly = true;

    // Parse sort
    const sort = searchParams.get(FILTER_TO_URL_PARAMS.sortBy);
    if (
      sort &&
      ["rating", "price_low", "price_high", "newest"].includes(sort)
    ) {
      filters.sortBy = sort as SortOption;
    }

    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<SearchFiltersState>(filtersFromUrl);

  // Sync filters to URL when they change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.searchQuery)
      params.set(FILTER_TO_URL_PARAMS.searchQuery, filters.searchQuery);
    if (filters.skills.length > 0)
      params.set(FILTER_TO_URL_PARAMS.skills, filters.skills.join(","));
    if (filters.minPrice !== undefined)
      params.set(FILTER_TO_URL_PARAMS.minPrice, filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.set(FILTER_TO_URL_PARAMS.maxPrice, filters.maxPrice.toString());
    if (filters.minRating !== undefined)
      params.set(FILTER_TO_URL_PARAMS.minRating, filters.minRating.toString());
    if (filters.availability !== "all")
      params.set(FILTER_TO_URL_PARAMS.availability, filters.availability);
    if (filters.availabilityDays.length > 0)
      params.set(
        FILTER_TO_URL_PARAMS.availabilityDays,
        filters.availabilityDays.join(","),
      );
    if (filters.languages.length > 0)
      params.set(FILTER_TO_URL_PARAMS.languages, filters.languages.join(","));
    if (filters.timezone)
      params.set(FILTER_TO_URL_PARAMS.timezone, filters.timezone);
    if (filters.verifiedOnly)
      params.set(FILTER_TO_URL_PARAMS.verifiedOnly, "true");
    if (filters.sortBy !== "rating")
      params.set(FILTER_TO_URL_PARAMS.sortBy, filters.sortBy);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Update a single filter
  const updateFilter = useCallback(
    <K extends keyof SearchFiltersState>(
      key: K,
      value: SearchFiltersState[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Apply a filter preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = FILTER_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFilters((prev) => ({ ...prev, ...preset.filters }));
    }
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Update and persist view mode
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    }
  }, []);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.skills.length > 0) count++;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
      count++;
    if (filters.minRating !== undefined) count++;
    if (filters.availability !== "all") count++;
    if (filters.availabilityDays.length > 0) count++;
    if (filters.languages.length > 0) count++;
    if (filters.timezone) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  // Get filter state as URL-ready object (for sharing)
  const getShareableUrl = useCallback(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : "";
    const params = new URLSearchParams();

    if (filters.searchQuery) params.set("q", filters.searchQuery);
    if (filters.skills.length > 0)
      params.set("skills", filters.skills.join(","));
    if (filters.minPrice !== undefined)
      params.set("min_price", filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.set("max_price", filters.maxPrice.toString());
    if (filters.minRating !== undefined)
      params.set("min_rating", filters.minRating.toString());
    if (filters.availability !== "all")
      params.set("availability", filters.availability);
    if (filters.availabilityDays.length > 0)
      params.set("days", filters.availabilityDays.join(","));
    if (filters.languages.length > 0)
      params.set("languages", filters.languages.join(","));
    if (filters.timezone) params.set("timezone", filters.timezone);
    if (filters.verifiedOnly) params.set("verified", "true");
    if (filters.sortBy !== "rating") params.set("sort", filters.sortBy);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [filters]);

  return {
    filters,
    updateFilter,
    applyPreset,
    clearFilters,
    viewMode,
    setViewMode,
    activeFilterCount,
    getShareableUrl,
    presets: FILTER_PRESETS,
  };
};

export default useSearchFilters;
