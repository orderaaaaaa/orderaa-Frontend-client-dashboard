import type { Product } from '../types/products';

export const PRODUCT_IMAGE_PLACEHOLDER = 'https://placehold.net/600x600.png';

export const productEditHref = (productId: number) =>
  `/dashboard/products/${productId}/edit`;

export function productGalleryImages(
  product: Pick<Product, 'image' | 'images'>,
): string[] {
  const images = (product.images ?? []).filter(Boolean);
  if (images.length > 0) return images;
  return product.image ? [product.image] : [];
}
