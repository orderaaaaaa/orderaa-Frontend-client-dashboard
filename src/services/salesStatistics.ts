import { keepPreviousData, useQuery, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import {
  fetchSalesStatistics,
  fetchSalesStatisticsFilterOptions,
  fetchSalesStatisticsLifetimePieces,
  fetchSalesStatisticsOrders,
  fetchSalesStatisticsPieces,
} from '@/lib/api/salesStatistics';
import type {
  SalesOrderSet,
  SalesStatisticsParams,
} from '@/app/dashboard/statistics/sales/types';

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

export const useSalesStatisticsOrdersQuery = (
  params: SalesStatisticsParams,
  set: SalesOrderSet,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_STATISTICS_ORDERS, params, set] as QueryKey,
    enabled,
    queryFn: () => fetchSalesStatisticsOrders(params, set),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useSalesStatisticsPiecesQuery = (params: SalesStatisticsParams, enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_STATISTICS_PIECES, params] as QueryKey,
    enabled,
    queryFn: () => fetchSalesStatisticsPieces(params),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};

export const useSalesStatisticsLifetimePiecesQuery = (approvedOnly: boolean, enabled: boolean) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_STATISTICS_LIFETIME_PIECES, approvedOnly] as QueryKey,
    enabled,
    queryFn: () => fetchSalesStatisticsLifetimePieces(approvedOnly),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
};
