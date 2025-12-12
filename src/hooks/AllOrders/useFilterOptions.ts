import { useFilterOptionsQuery } from '@/services/orders';

/**
 * Hook for fetching filter options using React Query
 * Maintains backward compatible interface
 */
export function useFilterOptions() {
  const { data, isLoading, error } = useFilterOptionsQuery();

  const defaultOptions = {
    governorates: [],
    cities: [],
    areas: [],
    productNames: [],
    productSizes: [],
    productColors: [],
  };

  return {
    options: data?.success ? data.data : defaultOptions,
    loading: isLoading,
    error: error?.message || null,
  };
}
