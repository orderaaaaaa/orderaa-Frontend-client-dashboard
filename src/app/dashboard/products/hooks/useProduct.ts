import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products'; // Adjust path as needed
import { productKeys } from './queryKeys';
import { UpdateVariantsPayload } from '../types/products';

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

export const useUpdateProductVariants = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVariantsPayload) =>
      productsApi.updateVariantsOptions(productId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.variants(productId),
      });
    },
  });
};
