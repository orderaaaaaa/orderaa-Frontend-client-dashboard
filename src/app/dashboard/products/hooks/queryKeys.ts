export const productKeys = {
  all: ['products'] as const,
  list: (page: number, limit: number) =>
    [...productKeys.all, 'list', page, limit] as const,
  variants: (productId: number) =>
    [...productKeys.all, 'variants', productId] as const,
};
