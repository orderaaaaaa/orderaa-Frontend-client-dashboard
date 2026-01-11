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

    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProducts = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => {
        if (!old || !old.data) return old;

        return {
          ...old,
          data: old.data.map((product: any) =>
            product.id === productId
              ? {
                  ...product,
                  extraDetails: {
                    ...product.extraDetails,
                    variants: newPayload.variants,
                  },
                }
              : product
          ),
        };
      });

      return { previousProducts };
    },

    onError: (err, newPayload, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.all, context.previousProducts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
};
