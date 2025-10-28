import { useState, useRef, useEffect } from 'react';
import { Product, ProductDropdownProps, Variant } from '@/types/orders';
import { mockProducts } from '@/constants/orders-tabs';

export const useProductDropdown = ({
  value,
  onChange,
  onAddProductClick,
}: ProductDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(
    value || []
  );
  const [pendingSelections, setPendingSelections] = useState<
    Record<number, { product: Product; variant: Variant }>
  >({});
  const [selectedVariants, setSelectedVariants] = useState<
    Record<number, Variant | undefined>
  >({});
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );

  const ref = useRef<HTMLDivElement>(null);

  // Sync with parent value changes
  useEffect(() => {
    if (value) {
      setSelectedProducts(value);
    }
  }, [value]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setExpandedProductId(null);
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

  const handleToggleDropdown = () => setIsOpen(!isOpen);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  const handleSearchFocus = () => setIsOpen(true);

  const handleProductClick = (product: Product) => {
    setExpandedProductId(expandedProductId === product.id ? null : product.id);
  };

  const handleVariantSelect = (
    productId: number,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    e.stopPropagation(); // Prevent event bubbling

    const product = filteredProducts.find((p) => p.id === productId);
    if (!product) return;

    const isCurrentlySelected =
      pendingSelections[productId]?.variant.id === variant.id;

    if (isCurrentlySelected) {
      // Deselect the variant from pending selections
      const newPendingSelections = { ...pendingSelections };
      delete newPendingSelections[productId];
      setPendingSelections(newPendingSelections);

      const newSelectedVariants = { ...selectedVariants };
      delete newSelectedVariants[productId];
      setSelectedVariants(newSelectedVariants);
    } else {
      // Add to pending selections
      const productForState: Product = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variants: product.variants,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      };

      const newPendingSelections = {
        ...pendingSelections,
        [productId]: { product: productForState, variant },
      };
      setPendingSelections(newPendingSelections);

      const newSelectedVariants = {
        ...selectedVariants,
        [productId]: variant,
      };
      setSelectedVariants(newSelectedVariants);
    }
  };

  const handleAddProduct = () => {
    // Convert pending selections to selected products
    const newSelectedProducts = Object.values(pendingSelections).map(
      (selection) => selection.product
    );

    if (newSelectedProducts.length > 0) {
      setSelectedProducts(newSelectedProducts);
      onChange(newSelectedProducts);
      onAddProductClick?.(newSelectedProducts);
    }

    // Clear pending selections and close dropdown
    setPendingSelections({});
    setIsOpen(false);
    setExpandedProductId(null);
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
      handleToggleDropdown,
      handleSearchChange,
      handleSearchFocus,
      handleProductClick,
      handleVariantSelect,
      handleAddProduct,
    },
  };
};
