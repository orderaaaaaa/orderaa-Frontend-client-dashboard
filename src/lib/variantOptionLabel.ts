export interface VariantOptionLabelItem {
  option: { name: string };
}

export interface VariantDisplayItem {
  attribute: { name: string };
  option: { name: string };
}

export const variantOptionLabel = (items: VariantOptionLabelItem[]): string =>
  items.map((item) => item.option.name).join(' / ');

export const variantDisplayLabel = (items: VariantDisplayItem[]): string =>
  items.map((item) => `${item.attribute.name}: ${item.option.name}`).join(' / ');

interface VariantPlainLabelSource {
  productName: string;
  sku: string | null | undefined;
  options: VariantDisplayItem[];
}

export const variantPlainLabel = ({
  productName,
  sku,
  options,
}: VariantPlainLabelSource): string =>
  variantDisplayLabel(options) || sku || productName;
