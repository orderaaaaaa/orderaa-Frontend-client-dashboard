import { create } from 'zustand';
import { comboKeyOf } from '@/components/stock/variantAvailabilityModel';

interface VariantOption {
  attribute: string;
  options: string[];
}

interface ProductAttribute {
  id: number;
  name: string;
  options: Array<{ id: number; name: string }>;
}

interface ApiProduct {
  id: number;
  name: string;
  price?: number | null;
  image?: string;
  variantOptions: VariantOption[];
  attributes?: ProductAttribute[];
}

interface SelectedVariantValue {
  attributeId: number;
  attribute: string;
  optionId: number;
  option: string;
}

export interface PendingProduct {
  product: ApiProduct;
  selectedVariants: SelectedVariantValue[];
}

export const missingAttributeNamesOf = (
  product: Pick<ApiProduct, 'attributes'>,
  selectedVariants: readonly Pick<SelectedVariantValue, 'attributeId'>[]
): string[] => {
  const chosen = new Set(selectedVariants.map((variant) => variant.attributeId));
  return (product.attributes ?? [])
    .filter((attribute) => !chosen.has(attribute.id))
    .map((attribute) => attribute.name);
};

export const missingAttributesOfPending = (pending: PendingProduct): string[] =>
  missingAttributeNamesOf(pending.product, pending.selectedVariants);

const variantOf = (
  product: ApiProduct,
  attributeId: number,
  optionId: number
): SelectedVariantValue | null => {
  const attribute = product.attributes?.find((a) => a.id === attributeId);
  const option = attribute?.options.find((o) => o.id === optionId);
  return attribute && option
    ? { attributeId, attribute: attribute.name, optionId, option: option.name }
    : null;
};

export interface SelectedProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedVariants: Array<Pick<SelectedVariantValue, 'attribute' | 'option'>>;
  attributeOptionIds: number[];
  sourceIndex?: number;
  variantEdited?: boolean;
}

interface ProductDropdownState {
  isOpen: boolean;
  search: string;
  expandedProductId: number | null;
  selectedProducts: SelectedProduct[];
  selectedVariants: Record<number, SelectedVariantValue[]>;
  pendingSelections: Record<number, PendingProduct>;

  toggleDropdown: () => void;
  setSearch: (search: string) => void;
  setSelectedProducts: (products: SelectedProduct[]) => void;
  expandProduct: (productId: number) => void;
  collapseProduct: () => void;
  toggleProductExpansion: (productId: number) => void;
  selectVariant: (
    productId: number,
    attributeId: number,
    optionId: number,
    product: ApiProduct
  ) => void;
  addProductWithoutVariants: (product: ApiProduct) => void;
  removeProductFromPending: (productId: number) => void;
  deselectVariant: (productId: number, attributeId: number) => void;
  clearPendingSelections: () => void;
  confirmSelections: () => SelectedProduct[];
  reset: () => void;
}

const initialState = {
  isOpen: false,
  search: '',
  expandedProductId: null,
  selectedProducts: [] as SelectedProduct[],
  selectedVariants: {} as Record<number, SelectedVariantValue[]>,
  pendingSelections: {} as Record<number, PendingProduct>,
};

export const useProductDropdownStore = create<ProductDropdownState>(
  (set, get) => ({
    ...initialState,

    toggleDropdown: () => {
      const { isOpen } = get();
      set({ isOpen: !isOpen, expandedProductId: null });
    },

    setSearch: (search) => {
      set({ search, isOpen: true });
    },

    setSelectedProducts: (products) => {
      set({ selectedProducts: products });
    },

    expandProduct: (productId) => {
      set({ expandedProductId: productId });
    },

    collapseProduct: () => {
      set({ expandedProductId: null });
    },

    toggleProductExpansion: (productId) => {
      const { expandedProductId } = get();
      set({
        expandedProductId: expandedProductId === productId ? null : productId,
      });
    },

    selectVariant: (productId, attributeId, optionId, product) => {
      const { pendingSelections, selectedVariants } = get();

      const variant = variantOf(product, attributeId, optionId);
      if (!variant) return;

      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const existing = currentSelections.find((v) => v.attributeId === attributeId);

      let newSelections: SelectedVariantValue[];
      if (existing) {
        if (existing.optionId === optionId) {
          newSelections = currentSelections.filter((v) => v.attributeId !== attributeId);
        } else {
          newSelections = currentSelections.map((v) =>
            v.attributeId === attributeId ? variant : v
          );
        }
      } else {
        newSelections = [...currentSelections, variant];
      }

      if (newSelections.length === 0) {
        const newPendingSelections = { ...pendingSelections };
        delete newPendingSelections[productId];
        const newSelectedVariants = { ...selectedVariants };
        delete newSelectedVariants[productId];
        set({
          pendingSelections: newPendingSelections,
          selectedVariants: newSelectedVariants,
        });
      } else {
        set({
          pendingSelections: {
            ...pendingSelections,
            [productId]: {
              product,
              selectedVariants: newSelections,
            },
          },
          selectedVariants: {
            ...selectedVariants,
            [productId]: newSelections,
          },
        });
      }
    },

    addProductWithoutVariants: (product) => {
      const { pendingSelections, selectedVariants } = get();

      set({
        pendingSelections: {
          ...pendingSelections,
          [product.id]: {
            product,
            selectedVariants: [],
          },
        },
        selectedVariants: {
          ...selectedVariants,
          [product.id]: [],
        },
      });
    },

    removeProductFromPending: (productId) => {
      const { pendingSelections, selectedVariants } = get();
      const newPendingSelections = { ...pendingSelections };
      delete newPendingSelections[productId];
      const newSelectedVariants = { ...selectedVariants };
      delete newSelectedVariants[productId];
      set({
        pendingSelections: newPendingSelections,
        selectedVariants: newSelectedVariants,
      });
    },

    deselectVariant: (productId, attributeId) => {
      const { pendingSelections, selectedVariants } = get();
      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const newSelections = currentSelections.filter((v) => v.attributeId !== attributeId);

      if (newSelections.length === 0) {
        const newPendingSelections = { ...pendingSelections };
        delete newPendingSelections[productId];
        const newSelectedVariants = { ...selectedVariants };
        delete newSelectedVariants[productId];
        set({
          pendingSelections: newPendingSelections,
          selectedVariants: newSelectedVariants,
        });
      } else {
        set({
          pendingSelections: {
            ...pendingSelections,
            [productId]: {
              ...pendingSelections[productId],
              selectedVariants: newSelections,
            },
          },
          selectedVariants: {
            ...selectedVariants,
            [productId]: newSelections,
          },
        });
      }
    },

    clearPendingSelections: () => {
      set({
        pendingSelections: {},
        selectedVariants: {},
      });
    },

    confirmSelections: () => {
      const { pendingSelections, selectedProducts } = get();

      const pending = Object.values(pendingSelections);
      const complete = pending.filter(
        (selection) => missingAttributesOfPending(selection).length === 0
      );
      const incomplete = pending.filter(
        (selection) => missingAttributesOfPending(selection).length > 0
      );

      const newProducts: SelectedProduct[] = complete.map(
        (selection) => ({
          id: selection.product.id,
          name: selection.product.name,
          price: String(selection.product.price ?? ''),
          image: selection.product.image || '',
          quantity: 1,
          selectedVariants: selection.selectedVariants,
          attributeOptionIds: selection.selectedVariants.map((variant) => variant.optionId),
        })
      );

      const merged = [...selectedProducts];
      for (const p of newProducts) {
        const variantKey = comboKeyOf(p.attributeOptionIds);
        const existingIndex = merged.findIndex(
          (m) => m.id === p.id && comboKeyOf(m.attributeOptionIds) === variantKey
        );
        if (existingIndex === -1) {
          merged.push(p);
        } else {
          merged[existingIndex] = {
            ...merged[existingIndex],
            quantity: merged[existingIndex].quantity + 1,
          };
        }
      }

      set({
        selectedProducts: merged,
        pendingSelections: Object.fromEntries(
          incomplete.map((selection) => [selection.product.id, selection])
        ),
        selectedVariants: Object.fromEntries(
          incomplete.map((selection) => [
            selection.product.id,
            selection.selectedVariants,
          ])
        ),
      });

      return merged;
    },

    reset: () => {
      set(initialState);
    },
  })
);
