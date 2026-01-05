import { useConfirmOrderStatisticsQuery } from '../services';

export function useConfirmOrderStatistics() {
  const { data, isLoading, error, refetch } = useConfirmOrderStatisticsQuery();

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
