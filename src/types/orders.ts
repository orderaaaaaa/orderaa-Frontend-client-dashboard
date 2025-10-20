// Order status enum matching the backend
export enum OrderStatus {
  TRIED_TO_REACH_CUSTOMER = 'TRIED_TO_REACH_CUSTOMER',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  ON_HOLD = 'ON_HOLD',
  CALLED_CUSTOMER_AGAIN = 'CALLED_CUSTOMER_AGAIN',
  CANCELLED = 'CANCELLED',
  CONFIRMED = 'CONFIRMED',
  PREPARED = 'PREPARED',
  SHIPPED = 'SHIPPED',
  RETURNED = 'RETURNED',
  DELIVERED = 'DELIVERED',
  DOWN_PAYMENT = 'DOWN_PAYMENT',
  MISSING = 'MISSING',
}

// Product interface matching the DB model
export interface Product {
  id: number;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  manufactureCompany?: string;
  createdAt: string;
  updatedAt: string;
}

// OrderProduct interface (join table)
export interface OrderProduct {
  orderId: number;
  productId: number;
  quantity: number;
  product: Product;
}

// Customer interface
export interface Customer {
  id: number;
  name: string;
  phone: string;
  governorate?: string;
  city?: string;
  address?: string;
}

// Merchant interface
export interface Merchant {
  id: number;
  name: string;
}

// Order interface matching the DB model
export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalCost: number;
  numberOfTriesToReach: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  merchantId: number;
  customerId: number;
  merchant?: Merchant;
  customer?: Customer;
  orderProducts?: OrderProduct[];
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
  status?: OrderStatus;
  search?: string;
}

export interface FilterOptions {
  productOptions: string[];
  sizeColorOptions: string[];
  governorateOptions: string[];
  areaOptions: string[];
}
