import { useQuery } from '@tanstack/react-query';
import { getShippingTypes } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';

export interface ShippingTypeOption {
  key: string;
  label: string;
}

export default function useShippingTypes(enabled: boolean = true) {
  const {
    data,
    error,
    isLoading,
    isFetching,
  } = useQuery<ShippingTypeOption[]>({
    queryKey: [QUERY_KEYS.SHIPPING_TYPES],
    queryFn: async () => {
      const data = await getShippingTypes();
      return data as ShippingTypeOption[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });

  const shippingTypes: ShippingTypeOption[] = data ?? [];

  return {
    shippingTypes,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
