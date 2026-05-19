import { useQuery, QueryKey } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getProductAttributeOptions } from '@/lib/api/products';

export const useProductAttributeOptionsQuery = (productId: number | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT_ATTRIBUTE_OPTIONS, productId] as QueryKey,
    queryFn: () => getProductAttributeOptions(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};
