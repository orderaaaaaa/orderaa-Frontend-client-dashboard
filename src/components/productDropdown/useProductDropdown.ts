import { useRef, useEffect } from 'react';
import { Variant } from '@/types/orders';
import { mockProducts } from '@/constants/orders-tabs';
import { useProductDropdownStore } from '@/store/productDropdownStore';

export const useProductDropdown = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Get store state and actions
  const store = useProductDropdownStore();
  const {
    isOpen,
    search,
    selectedProducts,
    selectedVariants,
    expandedProductId,
    toggleDropdown,
    setSearch,
    toggleProductExpansion,
    selectVariant,
    confirmSelections,
  } = store;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        useProductDropdownStore.setState({
          isOpen: false,
          expandedProductId: null,
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter products based on search
  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleProductClick = (product: { id: number }) => {
    toggleProductExpansion(product.id);
  };

  const handleVariantSelect = (
    productId: number,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation();

    const product = filteredProducts.find((p) => p.id === productId) as any;
    if (!product) return;

    selectVariant(productId, variant, product);
  };

  const handleAddProduct = () => {
    confirmSelections();
  };

  return {
    ref,
    isOpen,
    search,
    selectedProducts,
    selectedVariants,
    expandedProductId,
    filteredProducts,
    handlers: {
      handleToggleDropdown: toggleDropdown,
      handleSearchChange,
      handleSearchFocus: () =>
        useProductDropdownStore.setState({ isOpen: true }),
      handleProductClick,
      handleVariantSelect,
      handleAddProduct,
    },
  };
};
