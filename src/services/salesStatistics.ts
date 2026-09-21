import { keepPreviousData, useQuery, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  fetchSalesStatistics,
  fetchSalesStatisticsFilterOptions,
} from '@/lib/api/salesStatistics';
import type { SalesStatisticsParams } from '@/app/dashboard/statistics/sales/types';

export const useSalesStatisticsQuery = (params: SalesStatisticsParams, enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_STATISTICS, params] as QueryKey,
    enabled,
    queryFn: () => fetchSalesStatistics(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useSalesStatisticsFilterOptionsQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_STATISTICS_FILTER_OPTIONS] as QueryKey,
    enabled,
    queryFn: fetchSalesStatisticsFilterOptions,
    staleTime: 300_000,
  });
};
