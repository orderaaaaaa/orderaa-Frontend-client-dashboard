import { useQuery } from '@tanstack/react-query';
import { getShippingCompanies } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type { ShippingCompanyRef } from '@/types/shippingCompanies';

export const shippingCompaniesQueryOptions = {
  queryKey: [QUERY_KEYS.SHIPPING_COMPANIES],
  queryFn: getShippingCompanies,
  staleTime: 5 * 60 * 1000,
};

export default function useShippingCompanies(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useQuery<ShippingCompanyRef[]>({
    ...shippingCompaniesQueryOptions,
    retry: 1,
    enabled,
  });

  const shippingCompanies: ShippingCompanyRef[] = data ?? [];

  return {
    shippingCompanies,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
