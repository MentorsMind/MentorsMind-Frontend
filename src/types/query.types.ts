export interface QueryDataOptions<T> {
  fetchFn: () => Promise<T>;
  deps?: unknown[];
  // cache controls
  staleTime?: number;
  gcTime?: number; // v5 (cacheTime in v4)
}

export interface QueryDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
