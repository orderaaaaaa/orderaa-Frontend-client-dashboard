import { useProductsVariantsOptions } from '@/services/orders';
import type { SelectedProduct } from '@/store/productDropdownStore';
import {
  attributesWithoutSingleOption,
  type IncompleteVariantLine,
} from '@/utils/variantSelection';

export interface IncompleteVariantLineAt extends IncompleteVariantLine {
  index: number;
}

export interface IncompleteVariantLinesState {
  lines: IncompleteVariantLineAt[];
  isChecking: boolean;
}

export function useIncompleteVariantLines(
  products: readonly SelectedProduct[]
): IncompleteVariantLinesState {
  const { byProductId, isPending } = useProductsVariantsOptions(
    products.map((product) => product.id)
  );
  const lines = products.flatMap((product, index) => {
    const catalog = byProductId.get(product.id);
    if (!catalog) return [];
    const missing = attributesWithoutSingleOption(
      catalog,
      product.attributeOptionIds ?? []
    );
    return missing.length > 0
      ? [{ index, productName: product.name, missing }]
      : [];
  });
  return { lines, isChecking: isPending };
}
