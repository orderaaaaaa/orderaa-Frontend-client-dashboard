import { create } from 'zustand';

interface VariantOption {
  label: string;
  values: string[];
}

interface ApiProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  variantOptions: VariantOption[];
}

interface SelectedVariantValue {
  label: string;
  value: string;
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
    label: string,
    value: string,
    product: ApiProduct
  ) => void;
  addProductWithoutVariants: (product: ApiProduct) => void;
  removeProductFromPending: (productId: number) => void;
  deselectVariant: (productId: number, label: string) => void;
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

    selectVariant: (productId, label, value, product) => {
      const { pendingSelections, selectedVariants } = get();

      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const existingIndex = currentSelections.findIndex((v) => v.label === label);

      let newSelections: SelectedVariantValue[];
      if (existingIndex >= 0) {
        if (currentSelections[existingIndex].value === value) {
          newSelections = currentSelections.filter((v) => v.label !== label);
        } else {
          newSelections = currentSelections.map((v) =>
            v.label === label ? { label, value } : v
          );
        }
      } else {
        newSelections = [...currentSelections, { label, value }];
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

    deselectVariant: (productId, label) => {
      const { pendingSelections, selectedVariants } = get();
      const currentSelections = pendingSelections[productId]?.selectedVariants || [];
      const newSelections = currentSelections.filter((v) => v.label !== label);

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
        })
      );

      const merged = [...selectedProducts];
      for (const p of newProducts) {
        const variantKey = JSON.stringify(
          p.selectedVariants.sort((a, b) => a.label.localeCompare(b.label))
        );
        const existingIndex = merged.findIndex(
          (m) =>
            m.id === p.id &&
            JSON.stringify(
              m.selectedVariants.sort((a, b) => a.label.localeCompare(b.label))
            ) === variantKey
        );
        if (existingIndex === -1) {
          merged.push(p);
        }
      }

      set({
        selectedProducts: merged,
        pendingSelections: {},
        selectedVariants: {},
        isOpen: false,
        expandedProductId: null,
      });

      return merged;
    },

    reset: () => {
      set(initialState);
    },
  })
);
