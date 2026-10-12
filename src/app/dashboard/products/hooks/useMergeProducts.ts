import { useMutation, useQueries } from '@tanstack/react-query';
import { productsApi } from '../api/products';
import { MergeProductsPayload, ProductDetail } from '../types/products';
import { productKeys } from './queryKeys';

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

export const useMergeProductDetails = (productIds: number[]) =>
  useQueries({
    queries: productIds.map((productId) => ({
      queryKey: productKeys.detail(productId),
      queryFn: () => productsApi.getDetail(productId),
      staleTime: 0,
    })),
    combine: (results) => ({
      details: results
        .map((result) => result.data)
        .filter((detail): detail is ProductDetail => detail !== undefined),
      isPending: results.some((result) => result.isPending),
      isFetching: results.some((result) => result.isFetching),
      error: results.find((result) => result.isError)?.error ?? null,
      refetch: () => Promise.all(results.map((result) => result.refetch())),
    }),
  });
