import api from './index';
import type {
  SalesLifetimePiecesResponse,
  SalesOrderSet,
  SalesOrdersResponse,
  SalesPiecesResponse,
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

export async function fetchSalesStatisticsOrders(
  params: SalesStatisticsParams,
  set: SalesOrderSet,
): Promise<SalesOrdersResponse> {
  const { data } = await api.get<SalesOrdersResponse>('/reports/sales-statistics/orders', {
    params: { ...buildQueryParams(params), set },
  });
  return data;
}

export async function fetchSalesStatisticsPieces(
  params: SalesStatisticsParams,
): Promise<SalesPiecesResponse> {
  const { data } = await api.get<SalesPiecesResponse>('/reports/sales-statistics/pieces', {
    params: buildQueryParams(params),
  });
  return data;
}

export async function fetchSalesStatisticsLifetimePieces(
  approvedOnly: boolean,
): Promise<SalesLifetimePiecesResponse> {
  const { data } = await api.get<SalesLifetimePiecesResponse>(
    '/reports/sales-statistics/lifetime-pieces',
    { params: { approvedOnly } },
  );
  return data;
}
