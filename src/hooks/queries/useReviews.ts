import { useQueryHelper, type BaseQueryArgs } from "../core/useQueryHelper";

export function useReviews<T>({
  fetchFn,
  deps = ["reviews"],
  staleTime = 1000 * 60, // 1 min default
  gcTime = 1000 * 60 * 5, // 5 min default
  isEmpty,
  enabled = true,
}: BaseQueryArgs<T>) {
  return useQueryHelper<T>({
    deps,
    fetchFn,
    staleTime,
    gcTime,
    enabled,
    isEmpty,
  });
}
