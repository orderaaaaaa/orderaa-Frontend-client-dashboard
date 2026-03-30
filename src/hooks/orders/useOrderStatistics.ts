import { useOrderStatisticsQuery } from '@/services/orders';
import { FilterOrdersDto } from '@/types/orders';

export function useOrderStatistics(filters?: FilterOrdersDto) {
  const { data, isLoading, error, refetch } = useOrderStatisticsQuery(filters);

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
