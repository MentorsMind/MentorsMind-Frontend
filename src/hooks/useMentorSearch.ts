/**
 * useMentorSearch — uses GET /mentors (cursor-based pagination).
 *
 * Endpoint: GET /mentors
 * Response: { data: { data: Mentor[], next_cursor: string|null, has_more: boolean, total: number } }
 *
 * Pagination strategy: "Load more" — each call appends to the existing list using
 * next_cursor. Changing any filter resets the list and fetches from the beginning.
 *
 * NOTE: Do NOT mix with GET /search (offset-based). That endpoint is used exclusively
 * by SearchPage via useSearch + search.service.ts.
 */
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
}

const ITEMS_PER_PAGE = 12;

function filtersFromParams(params: URLSearchParams): MentorSearchFilters {
  return {
    q: params.get("q") ?? "",
    skills: params.get("skills") ?? "",
    minRate: params.get("minRate") ?? "",
    maxRate: params.get("maxRate") ?? "",
    isAvailable: params.get("isAvailable") ?? "",
    minRating: params.get("minRating") ?? "",
  };
}

function paramsFromFilters(filters: MentorSearchFilters): URLSearchParams {
  const p = new URLSearchParams();
  (Object.keys(filters) as (keyof MentorSearchFilters)[]).forEach((k) => {
    if (filters[k]) p.set(k, filters[k]);
  });
  return p;
}

export function useMentorSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<MentorSearchFilters>(() =>
    filtersFromParams(searchParams)
  );
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Stable ref so loadMore closure always sees the latest cursor
  const cursorRef = useRef<string | null>(null);
  cursorRef.current = nextCursor;

  /** Fetch the first page for the given filters (resets list). */
  const fetchFirst = useCallback(async (f: MentorSearchFilters) => {
    setLoading(true);
    try {
      const result = await searchMentors({
        q: f.q || undefined,
        skills: f.skills || undefined,
        minPrice: f.minRate ? Number(f.minRate) : undefined,
        maxPrice: f.maxRate ? Number(f.maxRate) : undefined,
        minRating: f.minRating ? Number(f.minRating) : undefined,
        limit: ITEMS_PER_PAGE,
      });
      setMentors(result.mentors);
      setTotal(result.total);
      setNextCursor(result.next_cursor);
      setHasMore(result.has_more);
    } catch {
      setMentors([]);
      setTotal(0);
      setNextCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync URL → state on mount / back-navigation
  useEffect(() => {
    const f = filtersFromParams(searchParams);
    setFilters(f);
    fetchFirst(f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  /** Append the next page using the current cursor. */
  const loadMore = useCallback(async () => {
    if (!cursorRef.current) return;
    setLoadingMore(true);
    try {
      const result = await searchMentors({
        q: filters.q || undefined,
        skills: filters.skills || undefined,
        minPrice: filters.minRate ? Number(filters.minRate) : undefined,
        maxPrice: filters.maxRate ? Number(filters.maxRate) : undefined,
        minRating: filters.minRating ? Number(filters.minRating) : undefined,
        cursor: cursorRef.current,
        limit: ITEMS_PER_PAGE,
      });
      setMentors((prev) => [...prev, ...result.mentors]);
      setNextCursor(result.next_cursor);
      setHasMore(result.has_more);
    } catch {
      // keep existing list on error
    } finally {
      setLoadingMore(false);
    }
  }, [filters]);

  /** Update a single filter key; always resets to first page. */
  const updateFilter = useCallback(
    <K extends keyof MentorSearchFilters>(key: K, value: string) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        setSearchParams(paramsFromFilters(next), { replace: true });
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    const empty: MentorSearchFilters = {
      q: "", skills: "", minRate: "", maxRate: "", isAvailable: "", minRating: "",
    };
    setFilters(empty);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const countLabel = `${total} mentor${total !== 1 ? "s" : ""} found`;

  return {
    mentors,
    total,
    loading,
    loadingMore,
    hasMore,
    filters,
    updateFilter,
    clearFilters,
    loadMore,
    countLabel,
  };
}
