import { useOrderStatisticsQuery } from '@/services/orders';

export function useOrderStatistics(params?: { from?: string; to?: string }) {
  const { data, isLoading, error, refetch } = useOrderStatisticsQuery(params);

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
