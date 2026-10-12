import { useQuery } from '@tanstack/react-query';
import { getCustomerBadgeCounts } from '../api/getCustomerBadgeCounts';
import { CUSTOMERS_QUERY_KEY } from './useGetCustomers';

export const CUSTOMER_BADGE_COUNTS_QUERY_KEY = [
  CUSTOMERS_QUERY_KEY,
  'badge-counts',
] as const;

export function useCustomerBadgeCounts() {
  return useQuery({
    queryKey: CUSTOMER_BADGE_COUNTS_QUERY_KEY,
    queryFn: getCustomerBadgeCounts,
  });
}
