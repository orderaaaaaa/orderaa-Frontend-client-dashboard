import { useQuery, useQueries, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getProductAttributeOptions } from '@/lib/api/products';

export const productAttributeOptionsQueryOptions = (productId: number | null | undefined) => ({
  queryKey: [QUERY_KEYS.PRODUCT_ATTRIBUTE_OPTIONS, productId] as QueryKey,
  queryFn: () => getProductAttributeOptions(productId!),
  staleTime: 5 * 60 * 1000,
});

export const useProductAttributeOptionsQuery = (productId: number | null | undefined) => {
  return useQuery({
    ...productAttributeOptionsQueryOptions(productId),
    enabled: !!productId,
  });
};

export const useProductCardsFailed = (productIds: readonly number[]) => {
  const uniqueIds = Array.from(new Set(productIds));
  return useQueries({
    queries: uniqueIds.map((productId) => productAttributeOptionsQueryOptions(productId)),
    combine: (results) => results.some((result) => result.isError),
  });
};

export const useProductCards = (productId: number | null | undefined) => {
  const query = useProductAttributeOptionsQuery(productId);
  return {
    attributes: query.data?.options,
    cards: query.data?.variants,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
