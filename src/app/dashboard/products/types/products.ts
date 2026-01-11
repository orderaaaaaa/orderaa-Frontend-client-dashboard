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

export type VariantItem = {
  label: string;
  value: string;
};

export interface UpdateVariantsPayload {
  variants: VariantItem[];
}
