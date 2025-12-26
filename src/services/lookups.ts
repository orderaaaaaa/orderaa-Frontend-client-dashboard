import { useQuery, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getGovernorates, getCities } from '@/lib/api/lookups';

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
