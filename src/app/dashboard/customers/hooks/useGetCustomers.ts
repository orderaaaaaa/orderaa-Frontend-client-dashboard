import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCustomers } from '../api/getCustomers';
import { PaginatedCustomers } from '../types/customer';

interface UseGetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  latestOrderStatus?: string;
}

export function useGetCustomers(
  params: UseGetCustomersParams = {},
  options?: Omit<UseQueryOptions<PaginatedCustomers>, 'queryKey' | 'queryFn'>
) {
  const { page = 1, limit = 10, search, isBlocked, latestOrderStatus } = params;

  return useQuery({
    queryKey: [
      'customers',
      { page, limit, search, isBlocked, latestOrderStatus },
    ],
    queryFn: () =>
      getCustomers(page, limit, search, isBlocked, latestOrderStatus),
    ...options,
  });
}
