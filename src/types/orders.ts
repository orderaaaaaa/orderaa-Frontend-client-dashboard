// Filter types for UI
export interface OrderFilters {
  productName: string;
  sizeColor: string;
  governorate: string;
  area: string;
  shipmentCode: string;
  customerName: string;
  phone: string;
  address: string;
  executionDate?: string;
}

export interface FilterOptions {
  productOptions: string[];
  sizeColorOptions: string[];
  governorateOptions: string[];
  areaOptions: string[];
}

// API DTO types
export interface FilterOrdersDto {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  customerName?: string;
  phone?: string;
  governorate?: string;
  city?: string;
  productName?: string;
  shipmentCode?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Order entity types
export interface OrderItem {
  id: number;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  shipmentCode?: string;
  customerName: string;
  phone: string;
  alternativePhone?: string;
  governorate: string;
  city: string;
  address: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryAttempts?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  executionDate?: string;
}

// API Response types
export interface PaginatedOrdersResponse {
  data: Order[];
  meta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface OrderDetailsResponse {
  data: Order;
}
