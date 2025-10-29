import { create } from 'zustand';
import { Product, Variant, SelectedProduct } from '@/types/orders';

interface ProductWithVariant {
  product: Product;
  variant: Variant;
}

interface ProductDropdownState {
  // UI State
  isOpen: boolean;
  search: string;
  expandedProductId: number | null;

  // Selection State
  selectedProducts: SelectedProduct[];
  selectedVariants: Record<number, Variant | undefined>;
  pendingSelections: Record<number, ProductWithVariant>;

  // Actions
  toggleDropdown: () => void;
  setSearch: (search: string) => void;
  setSelectedProducts: (products: SelectedProduct[]) => void;
  expandProduct: (productId: number) => void;
  collapseProduct: () => void;
  toggleProductExpansion: (productId: number) => void;
  selectVariant: (
    productId: number,
    variant: Variant,
    product: Product
  ) => void;
  deselectVariant: (productId: number) => void;
  clearPendingSelections: () => void;
  confirmSelections: () => SelectedProduct[];
  reset: () => void;
}

const initialState = {
  isOpen: false,
  search: '',
  expandedProductId: null,
  selectedProducts: [] as SelectedProduct[],
  selectedVariants: {} as Record<number, Variant | undefined>,
  pendingSelections: {} as Record<number, ProductWithVariant>,
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

    selectVariant: (productId, variant, product) => {
      const { pendingSelections, selectedVariants } = get();

      const isCurrentlySelected =
        pendingSelections[productId]?.variant.id === variant.id;

      if (isCurrentlySelected) {
        // Deselect
        const newPendingSelections = { ...pendingSelections };
        delete newPendingSelections[productId];
        const newSelectedVariants = { ...selectedVariants };
        delete newSelectedVariants[productId];

        set({
          pendingSelections: newPendingSelections,
          selectedVariants: newSelectedVariants,
        });
      } else {
        // Select
        set({
          pendingSelections: {
            ...pendingSelections,
            [productId]: { product, variant },
          },
          selectedVariants: {
            ...selectedVariants,
            [productId]: variant,
          },
        });
      }
    },

    deselectVariant: (productId) => {
      const { pendingSelections, selectedVariants } = get();
      const newPendingSelections = { ...pendingSelections };
      const newSelectedVariants = { ...selectedVariants };
      delete newPendingSelections[productId];
      delete newSelectedVariants[productId];

      set({
        pendingSelections: newPendingSelections,
        selectedVariants: newSelectedVariants,
      });
    },

    clearPendingSelections: () => {
      set({
        pendingSelections: {},
        selectedVariants: {},
      });
    },

    confirmSelections: () => {
      const { pendingSelections } = get();

      // Convert pending selections to SelectedProduct format (product + selected variant only)
      const newProducts: SelectedProduct[] = Object.values(
        pendingSelections
      ).map((selection) => ({
        id: selection.product.id,
        name: selection.product.name,
        price: selection.product.price ?? '',
        image: selection.product.image ?? '',
        variant: selection.variant,
        createdAt: selection.product.createdAt ?? '',
        updatedAt: selection.product.updatedAt ?? '',
      }));

      set({
        selectedProducts: newProducts,
        pendingSelections: {},
        selectedVariants: {},
        isOpen: false,
        expandedProductId: null,
      });

      return newProducts;
    },

    reset: () => {
      set(initialState);
    },
  })
);
