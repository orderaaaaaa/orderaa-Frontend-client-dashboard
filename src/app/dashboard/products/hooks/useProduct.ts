import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products'; // Adjust path as needed
import { productKeys } from './queryKeys';

export const useGetProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: productKeys.list(page, limit),
    queryFn: () => productsApi.getAll(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetProductVariants = (productId: number) => {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => productsApi.getVariantOptions(productId),
    enabled: !!productId,
  });
};
