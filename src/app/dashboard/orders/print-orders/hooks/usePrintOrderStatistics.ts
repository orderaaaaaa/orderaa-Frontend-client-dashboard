import { FilterOrdersDto } from '@/types/orders';
import { usePrintOrderStatisticsQuery } from '../services';

export function usePrintOrderStatistics(filters?: FilterOrdersDto) {
  const { data, isLoading, error, refetch } = usePrintOrderStatisticsQuery(filters);

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
