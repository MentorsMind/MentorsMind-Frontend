import { useInfiniteQuery } from "@tanstack/react-query";

export type InfiniteQueryArgs<T> = {
  fetchFn: ({ pageParam }: { pageParam?: unknown }) => Promise<T>;
  deps?: unknown[];
  staleTime?: number;
  gcTime?: number;
  isEmpty?: (data: T | unknown) => boolean;
  enabled?: boolean;
  getNextPageParam: (lastPage: T, allPages: T[]) => unknown;
};

export function useMentors<T>({
  fetchFn,
  deps = [],
  staleTime = 1000 * 60, // 1 min default
  gcTime = 1000 * 60 * 5, // 5 min default
  isEmpty,
  enabled = true,
  getNextPageParam,
}: InfiniteQueryArgs<T>) {
  const q = useInfiniteQuery<T>({
    queryKey: ["mentors", ...deps],
    queryFn: fetchFn,
    staleTime,
    gcTime,
    enabled,
    initialPageParam: 0,
    getNextPageParam,
  });

  const resolvedIsEmpty =
    q.isSuccess &&
    (isEmpty
      ? isEmpty(q.data.pageParams)
      : !q.data?.pages?.length ||
        q.data.pages.every((p) => Array.isArray(p) && p.length === 0));

  return {
    data: q.data,
    pages: q.data?.pages ?? [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    isSuccess: q.isSuccess,
    isEmpty: resolvedIsEmpty,
    error: q.error,
    fetchNextPage: () => q.fetchNextPage(),
    hasNextPage: q.hasNextPage,
    refetch: () => q.refetch(),
  };
}
