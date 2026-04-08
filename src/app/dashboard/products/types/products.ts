export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string;
  color: string;
  sku: string;
  images: string[];
  image: string;
  totalOrders: number;
  totalSold: number;
  extraDetails: {
    variants?: VariantItem[];
  };
  variantOptions?: VariantOption[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  data: Product[];
}

export type VariantItem = {
  label: string;
  value: string;
};

export interface VariantOption {
  label: string;
  values: string[];
}

export interface VariantCountItem {
  label: string;
  value: string;
  count: number;
}

export interface VariantsCountResponse {
  productId: number;
  productName: string;
  variantCounts: VariantCountItem[];
  totalOrders: number;
}

export interface ProductState {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
}

export interface UpdateVariantsPayload {
  variants: VariantItem[];
}

export interface ProductQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SyncFailure {
  storeId: number;
  provider: string;
  error: string;
}

export interface SyncProductsResponse {
  synced: number;
  created: number;
  updated: number;
  failures: SyncFailure[];
}

export interface MergeProductsPayload {
  sourceProductId: number[];
  name?: string;
  sku?: string;
  price?: number;
  image?: string;
  images?: string[];
  variants?: VariantOption[];
}
