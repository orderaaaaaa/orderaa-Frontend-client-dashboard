export interface VariantOptionLabelItem {
  option: { name: string };
}

export const variantOptionLabel = (items: VariantOptionLabelItem[]): string =>
  items.map((item) => item.option.name).join(' / ');
