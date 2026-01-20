import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { UpdateVariantsPayload, ProductQueryParams } from '../types/products';
import { VariantsCountResponse } from '../types/products';

export const useGetProducts = (params: ProductQueryParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getAll(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetProductVariantCounts = (productId: number) => {
  return useQuery<VariantsCountResponse>({
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
              : product,
          ),
        };
      });

      return { previousProducts };
    },

    onError: (_err, _payload, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(productKeys.all, context.previousProducts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: productKeys.variants(productId),
      });
    },
  });
};
