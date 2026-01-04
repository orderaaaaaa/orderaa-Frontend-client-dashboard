import { useQuery } from '@tanstack/react-query';
import { getShippingCompanies } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export interface ShippingCompanyOption {
  key: string;
  label: string;
}

export default function useShippingCompanies(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useQuery<ShippingCompanyOption[]>({
    queryKey: [QUERY_KEYS.SHIPPING_COMPANIES],
    queryFn: async () => {
      const data = await getShippingCompanies();
      return data as ShippingCompanyOption[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });

  const shippingCompanies: ShippingCompanyOption[] = data ?? [];

  return {
    shippingCompanies,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
