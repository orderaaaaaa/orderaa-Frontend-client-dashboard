import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { useJobStore } from '@/store/useJobStore';
import {
  UpdateVariantsPayload,
  UpdateAttributesPayload,
  ProductQueryParams,
  VariantsCountResponse,
} from '../types/products';

export const useGetProducts = (params: ProductQueryParams, enabled = true) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getAll(params),
    placeholderData: (previousData) => previousData,
    enabled,
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

export const useUpdateProductAttributes = (productId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAttributesPayload) =>
      productsApi.updateProductAttributes(productId, payload),

    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: productKeys.all });

      const previousProducts = queryClient.getQueryData(productKeys.all);

      queryClient.setQueriesData({ queryKey: productKeys.all }, (old: any) => {
        if (!old || !old.data) return old;

        const flatVariants = newPayload.attributes.flatMap((attr) =>
          attr.options.map((opt) => ({ attribute: attr.name, option: opt.name })),
        );

        return {
          ...old,
          data: old.data.map((product: any) =>
            product.id === productId
              ? {
                  ...product,
                  extraDetails: {
                    ...product.extraDetails,
                    variants: flatVariants,
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

export const useSyncProducts = () => {
  return useMutation({
    mutationFn: () => productsApi.sync(),
    onSuccess: (data) => {
      toast.info('تم بدء مزامنة المنتجات...', { autoClose: 2000 });
      useJobStore.getState().addJob({ jobId: data.jobId, type: 'SYNC', label: 'مزامنة المنتجات' });
    },
  });
};
