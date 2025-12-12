import { useOrderStatisticsQuery } from '@/services/orders';

/**
 * Hook for fetching order statistics using React Query
 * Maintains backward compatible interface
 */
export function useOrderStatistics() {
  const { data, isLoading, error, refetch } = useOrderStatisticsQuery();

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
