import { LucideIcon } from 'lucide-react';

// Order Status Enum
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

// Customer Interface
export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  governorate?: string;
  area?: string;
}

// Product Interface
export interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  variants: Variant[]; // Change from string[] to Variant[]
  createdAt: string;
  updatedAt: string;
}

// Add Variant interface
export interface Variant {
  id: number;
  name: string;
}

// Order Product Interface
export interface OrderProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

// Order Interface
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
  customer: Customer;
  orderProducts: OrderProduct[];
}

// Filter DTO (matching backend FilterOrdersDto)
export interface FilterOrdersDto {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Legacy filters (for FilterSection component)
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

// export interface Product {
//   id: number;
//   name: string;
//   price: string;
//   image: string;
//   variants: string[];
// }

export interface ProductDropdownProps {
  value?: Product[];
  onChange: (products: Product[]) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
  onAddProductClick?: (selectedProducts: Product[]) => void; // Add this line
}
