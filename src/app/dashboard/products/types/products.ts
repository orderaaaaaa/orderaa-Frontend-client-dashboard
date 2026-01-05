export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string;
  color: string;
  sku: string;
  images: string;
  totalOrders: number;
  extraDetails: {
    weight: string;
    material: string;
  };
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

export interface VariantOption {
  label: string;
  values: string[];
}

export interface VariantsOptionsResponse {
  variantOptions: VariantOption[];
}

export interface ProductState {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}
