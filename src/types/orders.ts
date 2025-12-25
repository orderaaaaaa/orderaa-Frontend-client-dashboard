import { LucideIcon } from 'lucide-react';


// Order Status Enum (synced with backend)
export enum OrderStatus {
  NEW_ORDER = 'NEW_ORDER',
  ATTEMPTED = 'ATTEMPTED',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  WHATSAPP = 'WHATSAPP',
  POSTPONED = 'POSTPONED',
  CALL_AGAIN = 'CALL_AGAIN',
  STOPPED = 'STOPPED',
  CANCELLED = 'CANCELLED',
  UNCOMPLETED = 'UNCOMPLETED',
  CONFIRMED = 'CONFIRMED',
  PREPARED = 'PREPARED',
  SHIPPING = 'SHIPPING',
  RETURNED_DELIVERED = 'RETURNED_DELIVERED',
  DELIVERED = 'DELIVERED',
  PARTIAL_DELIVERY = 'PARTIAL_DELIVERY',
  MISSING = 'MISSING',
  REGISTERED = 'REGISTERED',
  REPORTS = 'REPORTS',
}

// Payment Method Enum (synced with backend)
export enum PaymentMethod {
  CASH = 'CASH',
  VISA_CARD = 'VISA_CARD',
  INSTAPAY = 'INSTAPAY',
  WALLET = 'WALLET',
}

// Payment Status Enum (synced with backend)
export enum PaymentStatus {
  PAID = 'PAID',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

// Payment Method Arabic Labels
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'كاش',
  [PaymentMethod.VISA_CARD]: 'فيزا',
  [PaymentMethod.INSTAPAY]: 'انستا باي',
  [PaymentMethod.WALLET]: 'محفظة الكترونية',
};

// Payment Status Arabic Labels
export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PAID]: 'مدفوع',
  [PaymentStatus.CASH_ON_DELIVERY]: 'دفع عند الاستلام',
  [PaymentStatus.PARTIALLY_PAID]: 'مدفوع جزئياً',
};

// Variant interface
export interface Variant {
  id: number;
  name: string;
  size: string;
}

// Selected Product Interface (product with only the selected variant)
export interface SelectedProduct {
  id: number;
  name: string;
  price: string;
  image: string;
  variant: Variant;
  createdAt: string;
  updatedAt: string;
}

// Order Interface (for simple use cases)
export interface SimpleOrder {
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
  customers: Customer;
  order_products: OrderProduct[];
}

// Filter DTO (matching backend FilterOrdersDto)
export interface FilterOrdersDto {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}
// In the DropdownContentProps interface, add:
export interface DropdownContentProps {
  filteredProducts: Product[] | any;
  selectedVariants: Record<number, Variant | undefined>;
  expandedProductId: number | null;
  onProductClick: (product: Product) => void;
  onVariantSelect: (
    productId: number,
    variant: Variant,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onAddProduct: () => void;
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void; // Add this line
}
// Pagination Meta
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
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

export interface ProductDropdownProps {
  value?: SelectedProduct[];
  onChange?: (products: SelectedProduct[]) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
  selectClassName?: string;
  placeholderClassName?: string;
  placeholderStyle?: React.CSSProperties;
  onAddProductClick?: (selectedProducts: SelectedProduct[]) => void;
}

// Order Format Enum
export enum OrderFormat {
  APP = 'APP',
  EASYORDER = 'EASYORDER',
}

// Customer Interface
export interface Customer {
  id: number;
  name: string;
  phone_numbers: string[];
  address?: string;
  governorate?: string;
  city?: string;
  area?: string;
  totalCustomerOrders?: number;
}

// Product Interface
export interface Product {
  id: number;
  name: string;
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  variants?: Variant[];
  price: number;
  sku?: string;
  image?: string;
  manufactureCompany?: string;
  createdAt: string;
  updatedAt: string;
}

// Order Product Variant
export interface OrderProductVariant {
  label: string;
  value: string;
}

// Order Product Interface
export interface OrderProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  sku?: string;
  variant?: string;
  variants?: OrderProductVariant[];
  products: Product;
}

// Order Interface
export interface Order {
  id: number;
  code: string;
  status: OrderStatus;
  totalCost: number;
  numberOfTriesToReach: number;
  notes?: string;
  format: OrderFormat;
  totalCustomerOrders: number;
  // Order details
  shippingCost?: number;
  shippingCompany?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  coupon?: string;
  couponDiscount?: number;

  // Shipping address
  governorate?: string;
  city?: string;
  address?: string;

  // Product details
  material?: string;
  weight?: string;
  countryOfManufacture?: string;
  packagingNotes?: string;

  // Time preferences
  timeFrom?: string;
  timeTo?: string;
  availableFrom?: string;
  availableTo?: string;

  // Marketing & tracking
  utmSource?: string;
  utmCampaign?: string;

  // External integrations
  externalOrderId?: string;
  referralCode?: string;

  createdAt: string;
  updatedAt: string;
  merchantId: number;
  customerId: number;
  customers: Customer;
  order_products: OrderProduct[];
  order_events?: OrderEvent[];
}

// Order Event Interface (from order details API)
export interface OrderEvent {
  id: number;
  orderId: number;
  employeeId?: number | null;
  status: string;
  note?: string | null;
  createdAt: string;
  employee?: {
    id: number;
    fullName: string;
    department: string;
  } | null;
}

// Filter DTO (matching backend FilterOrdersDto)
export interface FilterOrdersDto {
  status?: OrderStatus;
  search?: string;
  customerName?: string;
  customerPhone?: string;
  governorate?: string;
  city?: string;
  area?: string;
  productName?: string;
  page?: number;
  limit?: number;
  merchantId?: string;
  customerId?: string;
  code?: string;
  totalCost?: string;
  numberOfTriesToReach?: string;
  createdAfter?: string;
  createdBefore?: string;
  confirmedDate?: string;
}

// Pagination Meta
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Pagination Response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Legacy filters (for FilterSection component)
export interface OrderFilters {
  productName: string;
  sizeColor: string;
  governorate: string;
  city: string;
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

// Filter Options Response (from backend)
export interface FilterOptionsData {
  governorates: string[];
  cities: string[];
  areas: string[];
  productNames: string[];
  productSizes: string[];
  productColors: string[];
}

export interface FilterOptionsResponse {
  success: boolean;
  data: FilterOptionsData;
}

// Order Statistics Response (from backend)
export interface OrderStatistics {
  totalOrders: number;
  statusCounts: Record<string, number>;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface OrderStatisticsResponse {
  success: boolean;
  data: OrderStatistics;
}

// Order Status Item (from /lookups/order-statuses API)
export interface OrderStatusItem {
  key: string;
  label: string;
}
