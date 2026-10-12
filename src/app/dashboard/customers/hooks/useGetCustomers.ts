import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { getCustomers } from '../api/getCustomers';
import { GetCustomersParams, PaginatedCustomers } from '../types/customer';

export const CUSTOMERS_QUERY_KEY = 'customers';

export function useGetCustomers(
  params: GetCustomersParams = {},
  options?: Omit<UseQueryOptions<PaginatedCustomers>, 'queryKey' | 'queryFn'>
) {
  const {
    page = 1,
    limit = 10,
    search,
    isBlocked,
    latestOrderStatus,
    badge,
    segment,
  } = params;
  const query = { page, limit, search, isBlocked, latestOrderStatus, badge, segment };

  return useQuery({
    queryKey: [CUSTOMERS_QUERY_KEY, query],
    queryFn: () => getCustomers(query),
    placeholderData: keepPreviousData,
    ...options,
  });
}
