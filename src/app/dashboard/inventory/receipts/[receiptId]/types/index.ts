export interface ProductVariant {
  id: number;
  name: string;
  image: string;
  colors: string[];
  sizes: string[];
}

export interface SelectedVariant {
  variantId: number;
  variantName: string;
  color: string;
  size: string;
  quantity: number;
}

export interface ReceiptProduct {
  id: number;
  name: string;
  image: string;
  itemsCount: number;
  variantsCount: number;
  selectedVariants?: SelectedVariant[];
}
