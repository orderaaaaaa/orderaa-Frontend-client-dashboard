// Order Status Enum (synced with backend)
export enum OrderStatus {
  NEW_ORDER = 'NEW_ORDER',
  WHATSAPP_CONFIRMED = 'WHATSAPP_CONFIRMED',
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
  WAITING_FOR_PACKAGING = 'WAITING_FOR_PACKAGING',
  PREPARED = 'PREPARED',
  WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
  SHIPPING = 'SHIPPING',
  WITH_DRIVER = 'WITH_DRIVER',
  RETURNED_DELIVERED = 'RETURNED_DELIVERED',
  DELIVERED = 'DELIVERED',
  PARTIAL_DELIVERY = 'PARTIAL_DELIVERY',
  MISSING = 'MISSING',
  FINAL_RETURN = 'FINAL_RETURN',
  RETURN_RESEND_PENDING = 'RETURN_RESEND_PENDING',
  RETURN_WAREHOUSE = 'RETURN_WAREHOUSE',
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
  quantity?: number;
  selectedVariants?: Array<{ label: string; value: string }>;
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
  sizeColor: string;
  governorate: string;
  city: string;
  area: string;
  shipmentCode: string;
  customerName: string;
  phone: string;
  address: string;
  executionDate?: string;
  skipFilters?: boolean;
  orderByDirection?: 'asc' | 'desc' | '';
  productId?: string;
  storeId?: string;
  shippingCompany?: string;
  employeeName?: string;
  cancellationReasons?: string[];
}

export interface FilterOptions {
  productOptions: string[];
  sizeColorOptions: string[];
  governorateOptions: string[];
  areaOptions: string[];
  productIdOptions?: { key: string; value: string }[];
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

// Shipping Type Enum
export enum ShippingType {
  DELIVERY = 'DELIVERY',
  EXCHANGE = 'EXCHANGE',
  RETURN = 'RETURN',
  PARTIAL_RETURN = 'PARTIAL_RETURN',
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
  email?: string | null;
  address?: string;
  governorate?: string;
  city?: string;
  area?: string;
  totalCustomerOrders?: number;
  isBlocked?: boolean;
  blockedUntil?: string | null;
  notes?: string | string[];
  createdAt?: string;
  updatedAt?: string;
  merchantId?: number;
}

export interface ProductExternalId {
  storeId: number;
  externalId: string;
  externalProvider: string;
}

export interface ProductVariantOption {
  label: string;
  values: string[];
}

export interface ProductExtraDetailsVariant {
  id: string;
  sku?: string | null;
  price: string;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  inventory_quantity?: number;
}

export interface ProductFullVariant {
  name: string;
  productId: number;
  updatedAt?: string;
  variantOptions: ProductVariantOption[];
}

export interface ProductExtraDetails {
  tags?: string;
  status?: string;
  vendor?: string;
  product_type?: string;
  variants?: ProductExtraDetailsVariant[];
  fullVariants?: ProductFullVariant[];
  [key: string]: unknown;
}

export interface Product {
  id: number;
  merchantId?: number;
  storeId?: number | null;
  name: string;
  price: number;
  sku?: string | null;
  image?: string;
  images?: string[];
  extraDetails?: ProductExtraDetails;
  assets?: unknown[];
  externalIds?: ProductExternalId[];
  variantOptions?: ProductVariantOption[];
  createdAt: string;
  updatedAt: string;
  size?: string;
  color?: string;
  material?: string;
  weight?: string;
  variants?: Variant[];
  manufactureCompany?: string;
}

// Order Product Variant
export interface OrderProductVariant {
  label: string;
  value: string;
}

// Order Product Attribute (from API: name + selected option)
export interface OrderProductAttribute {
  id: number;
  name: string;
  options: {
    id: number;
    name: string;
  };
}

// Order Product Interface
export interface OrderProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity?: number;
  price: number;
  sku?: string | null;
  variant?: string;
  variants?: OrderProductVariant[];
  attributes?: OrderProductAttribute[];
  products: Product;
  createdAt?: string;
  updatedAt?: string;
}

// Merchant Interface
export interface Merchant {
  id: number;
  merchantName: string;
  email: string;
  phoneNumber: string;
  city: string;
  governorate: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  shippingPhoneNumber?: string;
  canOpenShipment?: boolean;
  employeeCanEditContent?: boolean;
  defaultShipmentContent?: string | null;
  defaultReturnShippingCost?: number;
  language?: string;
  autoCancelAttempts?: number;
  url?: string | null;
  utmSources?: string[];
}

// WhatsApp Template
export interface WhatsappTemplate {
  type: string;
  label: string;
  url: string;
}

// Shipping ID entry (one per attempted shipment)
export interface OrderShippingId {
  id: number;
  orderId: number;
  shippingId: string;
  shippingCompany?: string | null;
  isActive: boolean;
  createdAt: string;
}

// Order Interface
export interface Order {
  id: number;
  code: string;
  status: string;
  totalCost: number;
  numberOfTriesToReach: number;
  notes?: string | null;
  format: OrderFormat;
  storeId?: number | null;
  deletedAt?: string | null;

  // Order details
  shippingCost?: number;
  returnShippingCost?: number;
  shippingType?: ShippingType;
  returnShipmentContent?: string | null;
  shippingCompany?: string;
  shipmentContent?: string | null;
  canOpenShipment?: boolean;
  paymentStatus?: string;
  paymentMethod?: string;
  coupon?: string | null;
  couponDiscount?: number | null;

  // Shipping address
  governorate?: string;
  city?: string;
  address?: string;
  externalGovernorate?: string | null;
  shippingId?: string;
  shipping_ids?: OrderShippingId[];
  shippingNotes?: string | null;

  // Product details
  material?: string | null;
  weight?: string | null;
  countryOfManufacture?: string | null;
  countryOfOrder?: string | null;
  packagingNotes?: string | null;
  packagingWarning?: string | null;

  // Call center
  callCenterNotes?: string | null;

  // Cancel info
  cancelReason?: string | null;
  cancelNotes?: string | null;
  cancelReasonId?: number | null;
  cancelledByEmployeeId?: number | null;

  // Time preferences
  timeFrom?: string;
  timeTo?: string;
  availableFrom?: string;
  availableTo?: string;
  postponedUntil?: string | null;
  urgentDate?: string | null;
  executionDate?: string | null;

  // Marketing & tracking
  utmSource?: string;
  utmCampaign?: string;
  pageName?: string | null;

  // External integrations
  externalOrderId?: string;
  referralCode?: string | null;

  // Lock state
  lockedById?: number | null;
  lockedAt?: string | null;

  // Flags
  isNew?: boolean;
  isShadowed?: boolean;
  shadowedAt?: string | null;
  editRejectedNote?: string | null;

  createdAt: string;
  updatedAt: string;
  merchantId: number;
  customerId: number;
  customers: Customer;
  merchants?: Merchant;
  order_products: OrderProduct[];
  order_events?: OrderEvent[];
  locked_by?: OrderLockedBy | null;
  isPrinted?: boolean;
  printCount?: number;
  shipmentPickupCode?: string | null;
  pickupInvoice?: string | null;
  pickupCode?: string | null;
  states?: OrderState[];
  whatsappTemplates?: WhatsappTemplate[];
}

export interface OrderLockedBy {
  id: number;
  name: string;
  department: string;
}

export interface OrderState {
  note: string;
  createdAt: string;
}

export interface OrderEventEmployee {
  id: number;
  name: string;
  accessLevel?: string;
  department?: string;
  address?: string;
  governorate?: string | null;
  city?: string | null;
  workingHours?: unknown | null;
  merchantId?: number;
  isOnline?: boolean;
  lastActiveAt?: string | null;
  performanceScore?: number;
  performanceChange?: number;
  workingDaysThisMonth?: number;
  leaveDaysThisMonth?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderEvent {
  id: number;
  orderId: number;
  employeeId?: number | null;
  name: string;
  note?: string | null;
  createdAt: string;
  employee?: OrderEventEmployee | null;
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
  page?: number;
  limit?: number;
  merchantId?: string;
  customerId?: string;
  code?: string;
  totalCost?: string;
  numberOfTriesToReach?: string;
  createdAfter?: string;
  createdBefore?: string;
  executionDate?: string;
  skipFilters?: boolean;
  orderByDirection?: 'asc' | 'desc';
  isPrinted?: boolean;
  shippingCompany?: string;
  department?: string;
  productId?: string;
  cancelReasonId?: string[];
  storeId?: number;
  employeeName?: string;
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
  hasShadowedOrders?: boolean;
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
