import { ProductQueryParams } from '../types/products';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductQueryParams) =>
    [...productKeys.lists(), params] as const,
  variants: (productId: number) =>
    [...productKeys.all, 'variants', productId] as const,
  detail: (productId: number) =>
    [...productKeys.all, 'detail', productId] as const,
};
