// Order Status Enum (synced with backend)
export enum OrderStatus {
  NEW_ORDER = 'NEW_ORDER',
  ATTEMPTED = 'ATTEMPTED',
  WAITING_FOR_PAYMENT = 'WAITING_FOR_PAYMENT',
  WHATSAPP = 'WHATSAPP',
  EDIT_REJECTED = 'EDIT_REJECTED',
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
}

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
  status: string;
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
  status?: string;
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
  city: string;
  area: string;
  shipmentCode: string;
  customerName: string;
  phone: string;
  address: string;
  executionDate?: string;
  newFirst?: boolean;
  orderByDirection?: 'asc' | 'desc' | '';
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
  isBlocked?: boolean;
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
  status: string;
  totalCost: number;
  numberOfTriesToReach: number;
  notes?: string;
  format: OrderFormat;
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
  externalGovernorate?: string;
  shippingId?: string;

  // Product details
  material?: string;
  weight?: string;
  countryOfManufacture?: string;
  packagingNotes?: string;

  // Cancel info
  cancelReason?: string | null;
  cancelNotes?: string | null;

  // Time preferences
  timeFrom?: string;
  timeTo?: string;
  availableFrom?: string;
  availableTo?: string;
  postponedUntil?: string;

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
  locked_by?: OrderLockedBy | null;
  isPrinted?: boolean;
  shipmentPickupCode?: string | null;
  pickupInvoice?: string | null;
  pickupCode?: string | null;
}

export interface OrderLockedBy {
  id: number;
  name: string;
  department: string;
}

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
  status?: string;
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
  newFirst?: boolean;
  orderByDirection?: 'asc' | 'desc';
  isPrinted?: boolean;
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
