import { ProductQueryParams } from '../types/products';

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductQueryParams) =>
    [...productKeys.all, 'list', params] as const,
  variants: (productId: number) =>
    [...productKeys.all, 'variants', productId] as const,
};
