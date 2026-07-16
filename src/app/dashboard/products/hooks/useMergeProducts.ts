import { useMutation } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { MergeProductsPayload } from '../types/products';

export const useMergeProducts = () => {
  return useMutation({
    mutationFn: ({
      targetProductId,
      payload,
    }: {
      targetProductId: number;
      payload: MergeProductsPayload;
    }) => productsApi.merge(targetProductId, payload),
  });
};
