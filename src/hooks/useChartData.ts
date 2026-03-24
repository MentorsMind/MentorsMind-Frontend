import { useQuery } from "@tanstack/react-query";
import type {
  UseChartDataOptions,
  UseChartDataResult,
} from "../types/charts.types";

export function useChartData<T>({
  fetchFn,
  deps = [],
}: UseChartDataOptions<T>): UseChartDataResult<T> {
  const q = useQuery<T>({ queryKey: ["chartData", ...deps], queryFn: fetchFn });

  return {
    data: q.data ?? null,
    isLoading: q.isLoading,
    error: q.error instanceof Error ? q.error.message : null,
    refetch: q.refetch,
  };
}
