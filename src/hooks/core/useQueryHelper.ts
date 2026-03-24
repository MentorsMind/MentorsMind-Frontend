import { useQuery } from "@tanstack/react-query";

export type BaseQueryArgs<T> = {
  fetchFn: () => Promise<T>;
  deps?: unknown[];
  staleTime?: number;
  gcTime?: number;
  enabled?: boolean;
  isEmpty?: (data: T | undefined) => boolean;
};

export type UseQueryDataResult<T> = {
  data: T | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isEmpty: boolean;
  error: string | null;
  refetch: () => void;
};

export function useQueryHelper<T>({
  fetchFn,
  deps = [],
  staleTime = 1000 * 60,
  gcTime = 1000 * 60 * 5,
  isEmpty,
  enabled = true,
}: BaseQueryArgs<T>) {
  const q = useQuery<T>({
    queryKey: ["query", ...deps],
    queryFn: fetchFn,
    staleTime,
    gcTime,
    enabled,
  });

  const resolvedIsEmpty =
    q.isSuccess && isEmpty
      ? isEmpty(q.data)
      : q.data == null || (Array.isArray(q.data) && q.data.length === 0);

  return {
    data: q.data ?? null,
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    isEmpty: resolvedIsEmpty,
    error: q.error instanceof Error ? q.error.message : null,
    refetch: q.refetch,
    isSuccess: q.isSuccess,
  };
}
