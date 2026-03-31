import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { productKeys } from './queryKeys';
import { MergeProductsPayload } from '../types/products';

export const useMergeProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetProductId,
      payload,
    }: {
      targetProductId: number;
      payload: MergeProductsPayload;
    }) => productsApi.merge(targetProductId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
