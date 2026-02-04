import { useQuery, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getGovernorates, getCities, getPaymentMethods, getPaymentStatuses, getUtmSources } from '@/lib/api/lookups';

interface GovernorateData {
  key: string;
  value: string;
}

interface CityData {
  key: string;
  value: string;
}

// Fetch governorates with caching
export const useGovernoratesQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GOVERNORATES] as QueryKey,
    queryFn: async () => {
      const data = await getGovernorates();
      return Array.isArray(data) ? (data as GovernorateData[]) : [];
    },
    staleTime: Infinity,
  });
};

// Fetch cities for a governorate with caching
export const useCitiesQuery = (governorateKey: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CITIES, governorateKey] as QueryKey,
    queryFn: async () => {
      if (!governorateKey) return [];
      const data = await getCities(governorateKey);
      return Array.isArray(data) ? (data as CityData[]) : [];
    },
    enabled: !!governorateKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

interface PaymentMethodData {
  key: string;
  label: string;
}

interface PaymentStatusData {
  key: string;
  label: string;
}

// Fetch payment methods with caching
export const usePaymentMethodsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_METHODS] as QueryKey,
    queryFn: async () => {
      const data = await getPaymentMethods();
      return Array.isArray(data) ? (data as PaymentMethodData[]) : [];
    },
    staleTime: Infinity,
  });
};

// Fetch payment statuses with caching
export const usePaymentStatusesQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_STATUSES] as QueryKey,
    queryFn: async () => {
      const data = await getPaymentStatuses();
      return Array.isArray(data) ? (data as PaymentStatusData[]) : [];
    },
    staleTime: Infinity,
  });
};

// Fetch UTM sources - refetch on mount to get latest sources from settings
export const useUtmSourcesQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.UTM_SOURCES] as QueryKey,
    queryFn: async () => {
      const data = await getUtmSources();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });
};
