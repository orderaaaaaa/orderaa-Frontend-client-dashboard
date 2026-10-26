import {
  useOrderStatisticsQuery,
  type OrderQueryFocusOptions,
} from '@/services/orders';
import { FilterOrdersDto } from '@/types/orders';

export function useOrderStatistics(
  filters?: FilterOrdersDto,
  options?: OrderQueryFocusOptions
) {
  const { data, isLoading, error, refetch } = useOrderStatisticsQuery(
    filters,
    options
  );

  return {
    statistics: data?.success ? data.data : null,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
