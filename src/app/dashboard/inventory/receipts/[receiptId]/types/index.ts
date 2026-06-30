export interface AttributeOption {
  id: number;
  name: string;
}

export interface AttributeOptionGroup {
  id: number;
  name: string;
  options: AttributeOption[];
}

export interface ProductVariant {
  id: number;
  name: string;
  image: string;
  colors: string[];
  sizes: string[];
}

export interface SelectedVariant {
  attributeOptionIds: number[];
  attributeLabels: string[];
  quantity: number;
  variantId?: number;
  variantName?: string;
  color?: string;
  size?: string;
}

export interface ReceiptProduct {
  id: number;
  name: string;
  image: string;
  itemsCount: number;
  variantsCount: number;
  selectedVariants?: SelectedVariant[];
}
