import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMentors } from "../services/mentor.service";
import type { Mentor } from "../types";

export interface MentorSearchFilters {
  q: string;
  skills: string;
  minRate: string;
  maxRate: string;
  isAvailable: string;
  minRating: string;
  page: string;
}

/**
 * Filters that affect the backend `total` count accurately.
 * minRate, maxRate, isAvailable are NOT included because the backend
 * ignores them when computing total (issue #27).
 */
const ACCURATE_COUNT_KEYS: (keyof MentorSearchFilters)[] = ["q", "skills", "minRating"];

const ITEMS_PER_PAGE = 12;

function filtersFromParams(params: URLSearchParams): MentorSearchFilters {
  return {
    q: params.get("q") ?? "",
    skills: params.get("skills") ?? "",
    minRate: params.get("minRate") ?? "",
    maxRate: params.get("maxRate") ?? "",
    isAvailable: params.get("isAvailable") ?? "",
    minRating: params.get("minRating") ?? "",
    page: params.get("page") ?? "1",
  };
}

function paramsFromFilters(filters: MentorSearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  (Object.keys(filters) as (keyof MentorSearchFilters)[]).forEach((k) => {
    if (filters[k]) p.set(k, filters[k]);
  });
  return p;
}

/** Returns true when any of the "inaccurate" filters are active */
function hasInaccurateFilters(filters: MentorSearchFilters): boolean {
  return !!(filters.minRate || filters.maxRate || filters.isAvailable);
}

export function useMentorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MentorSearchFilters>(() =>
    filtersFromParams(searchParams)
  );
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Track previous filter values (excluding page) to detect filter changes
  const prevFiltersRef = useRef<Omit<MentorSearchFilters, "page">>();

  const fetch = useCallback(async (f: MentorSearchFilters) => {
    setLoading(true);
    try {
      const result = await searchMentors({
        q: f.q || undefined,
        skills: f.skills || undefined,
        minPrice: f.minRate ? Number(f.minRate) : undefined,
        maxPrice: f.maxRate ? Number(f.maxRate) : undefined,
        minRating: f.minRating ? Number(f.minRating) : undefined,
        page: Number(f.page) || 1,
        limit: ITEMS_PER_PAGE,
      });
      setMentors(result.mentors);
      setTotal(result.total);
    } catch {
      setMentors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL → state on mount / back-navigation
  useEffect(() => {
    const f = filtersFromParams(searchParams);
    setFilters(f);
    fetch(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  /** Update a single filter key; resets page to 1 on any filter change */
  const updateFilter = useCallback(
    <K extends keyof MentorSearchFilters>(key: K, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value, page: key !== "page" ? "1" : value };
        setSearchParams(paramsFromFilters(next), { replace: true });
        return next;
      });
    },
    [setSearchParams]
  );

  /** Clear all filters and reset page */
  const clearFilters = useCallback(() => {
    const empty: MentorSearchFilters = {
      q: "",
      skills: "",
      minRate: "",
      maxRate: "",
      isAvailable: "",
      minRating: "",
      page: "1",
    };
    setFilters(empty);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const currentPage = Number(filters.page) || 1;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  /**
   * Whether to show "X mentors found" or "Showing results".
   * When minRate/maxRate/isAvailable are active the backend total is inaccurate.
   */
  const countLabel = hasInaccurateFilters(filters)
    ? "Showing results"
    : `${total} mentor${total !== 1 ? "s" : ""} found`;

  return {
    mentors,
    total,
    loading,
    filters,
    updateFilter,
    clearFilters,
    currentPage,
    totalPages,
    countLabel,
    goToPage: (page: number) => updateFilter("page", String(page)),
  };
}
