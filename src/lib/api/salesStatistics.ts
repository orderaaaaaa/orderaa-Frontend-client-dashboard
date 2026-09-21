import api from './index';
import type {
  SalesStatisticsFilterOptions,
  SalesStatisticsParams,
  SalesStatisticsResponse,
} from '@/app/dashboard/statistics/sales/types';

function buildQueryParams(params: SalesStatisticsParams) {
  const { from, to, storeIds, carrierKeys, pageNames, approvedOnly } = params;
  return {
    from,
    to,
    approvedOnly,
    ...(storeIds && storeIds.length ? { storeIds } : {}),
    ...(carrierKeys && carrierKeys.length ? { carrierKeys } : {}),
    ...(pageNames && pageNames.length ? { pageNames } : {}),
  };
}

export async function fetchSalesStatistics(
  params: SalesStatisticsParams,
): Promise<SalesStatisticsResponse> {
  const { data } = await api.get<SalesStatisticsResponse>('/reports/sales-statistics', {
    params: buildQueryParams(params),
  });
  return data;
}

export async function fetchSalesStatisticsFilterOptions(): Promise<SalesStatisticsFilterOptions> {
  const { data } = await api.get<SalesStatisticsFilterOptions>(
    '/reports/sales-statistics/filter-options',
  );
  return data;
}
