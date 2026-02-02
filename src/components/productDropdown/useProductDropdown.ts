import { useRef, useEffect, useState, useMemo } from 'react';
import { useProductDropdownStore } from '@/store/productDropdownStore';
import { useDebounce } from '@/utils/debounce';
import api from '@/lib/api';

export interface VariantOption {
  label: string;
  values: string[];
}

export interface ApiProduct {
  id: number;
  name: string;
  price: number;
  image?: string;
  images: string[];
  variantOptions: VariantOption[];
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  totalSold: number;
}

interface ProductsApiResponse {
  data: ApiProduct[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const useProductDropdown = () => {
  const ref = useRef<HTMLDivElement>(null);

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
    addProductWithoutVariants,
    removeProductFromPending,
    confirmSelections,
  } = store;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const debouncedSearch = useDebounce(search, 300);

  const fetchProducts = async (pageNum: number, searchQuery: string, append = false) => {
    try {
      setIsLoading(true);
      const response = await api.get<ProductsApiResponse>('/products', {
        params: {
          page: pageNum,
          limit: 10,
          ...(searchQuery && { search: searchQuery }),
        },
      });

      const data = response.data;
      if (append) {
        setProducts((prev) => [...prev, ...data.data]);
      } else {
        setProducts(data.data);
      }
      setHasNextPage(data.hasNextPage);
      setTotalItems(data.totalItems);
      setPage(data.currentPage);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchProducts(1, debouncedSearch, false);
    }
  }, [isOpen, debouncedSearch]);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        useProductDropdownStore.setState({
          isOpen: false,
          expandedProductId: null,
        });
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleProductClick = (product: { id: number }) => {
    toggleProductExpansion(product.id);
  };

  const handleVariantSelect = (
    productId: number,
    label: string,
    value: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    selectVariant(productId, label, value, product);
  };

  const handleAddProduct = () => {
    confirmSelections();
    useProductDropdownStore.setState({ isOpen: false });
  };

  const handleAddProductWithoutVariants = (product: ApiProduct) => {
    addProductWithoutVariants(product);
  };

  const handleRemoveProductFromPending = (productId: number) => {
    removeProductFromPending(productId);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isLoading) {
      fetchProducts(page + 1, debouncedSearch, true);
    }
  };

  return {
    ref,
    isOpen,
    search,
    selectedProducts,
    selectedVariants,
    expandedProductId,
    products,
    isLoading,
    hasNextPage,
    totalItems,
    handlers: {
      handleToggleDropdown: toggleDropdown,
      handleSearchChange,
      handleSearchFocus: () =>
        useProductDropdownStore.setState({ isOpen: true }),
      handleProductClick,
      handleVariantSelect,
      handleAddProduct,
      handleAddProductWithoutVariants,
      handleRemoveProductFromPending,
      handleLoadMore,
    },
  };
};
