import { usePrintOrderStatisticsQuery } from '../services';

export function usePrintOrderStatistics() {
  const { data, isLoading, error, refetch } = usePrintOrderStatisticsQuery();

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
