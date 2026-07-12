import { create } from 'zustand';

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
  price: number;
  image?: string;
  variantOptions: VariantOption[];
  attributes?: ProductAttribute[];
}

interface SelectedVariantValue {
  attribute: string;
  option: string;
}

interface PendingProduct {
  product: ApiProduct;
  selectedVariants: SelectedVariantValue[];
}

export interface SelectedProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedVariants: SelectedVariantValue[];
  attributeOptionIds: number[];
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
    attribute: string,
    option: string,
    product: ApiProduct
  ) => void;
  addProductWithoutVariants: (product: ApiProduct) => void;
  removeProductFromPending: (productId: number) => void;
  deselectVariant: (productId: number, attribute: string) => void;
  clearPendingSelections: () => void;
  confirmSelections: () => SelectedProduct[];
  reset: () => void;
}

const resolveAttributeOptionIds = (
  product: ApiProduct,
  selectedVariants: SelectedVariantValue[]
): number[] => {
  const attributes = product.attributes ?? [];
  return selectedVariants.reduce<number[]>((ids, variant) => {
    const attr = attributes.find((a) => a.name === variant.attribute);
    const opt = attr?.options.find((o) => o.name === variant.option);
    if (opt) ids.push(opt.id);
    return ids;
  }, []);
};

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

    selectVariant: (productId, attribute, option, product) => {
      const { pendingSelections, selectedVariants } = get();

      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const existingIndex = currentSelections.findIndex((v) => v.attribute === attribute);

      let newSelections: SelectedVariantValue[];
      if (existingIndex >= 0) {
        if (currentSelections[existingIndex].option === option) {
          newSelections = currentSelections.filter((v) => v.attribute !== attribute);
        } else {
          newSelections = currentSelections.map((v) =>
            v.attribute === attribute ? { attribute, option } : v
          );
        }
      } else {
        newSelections = [...currentSelections, { attribute, option }];
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

    deselectVariant: (productId, attribute) => {
      const { pendingSelections, selectedVariants } = get();
      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const newSelections = currentSelections.filter((v) => v.attribute !== attribute);

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

      const newProducts: SelectedProduct[] = Object.values(pendingSelections).map(
        (selection) => ({
          id: selection.product.id,
          name: selection.product.name,
          price: String(selection.product.price),
          image: selection.product.image || '',
          quantity: 1,
          selectedVariants: selection.selectedVariants,
          attributeOptionIds: resolveAttributeOptionIds(
            selection.product,
            selection.selectedVariants
          ),
        })
      );

      const merged = [...selectedProducts];
      for (const p of newProducts) {
        const variantKey = JSON.stringify(
          [...p.selectedVariants].sort((a, b) => a.attribute.localeCompare(b.attribute))
        );
        const existingIndex = merged.findIndex(
          (m) =>
            m.id === p.id &&
            JSON.stringify(
              [...m.selectedVariants].sort((a, b) => a.attribute.localeCompare(b.attribute))
            ) === variantKey
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
        pendingSelections: {},
        selectedVariants: {},
      });

      return merged;
    },

    reset: () => {
      set(initialState);
    },
  })
);
