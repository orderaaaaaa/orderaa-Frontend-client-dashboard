import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { UpdateVariantsPayload } from '../types/products';

export const useGetProducts = (page: number, limit: number) => {
  return useQuery({
    queryKey: productKeys.list(page, limit),
    queryFn: () => productsApi.getAll(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

export const useUpdateProductVariants = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateVariantsPayload) =>
      productsApi.updateVariantsOptions(productId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
};
