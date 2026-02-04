export const QUERY_KEYS = {
  // Orders
  ORDERS: 'orders',
  ORDER_DETAILS: 'order-details',
  ORDER_STATISTICS: 'order-statistics',
  ORDER_FILTER_OPTIONS: 'order-filter-options',
  ORDER_STATUSES: 'order-statuses',
  DEPARTMENT_STATUSES: 'department-statuses',
  CUSTOMER_ORDERS: 'customer-orders',
  PRINT_ORDER_STATISTICS: 'print-order-statistics',

  // Products
  PRODUCTS: 'products',
  PRODUCT_VARIANTS_OPTIONS: 'product-variants-options',

  // Lookups
  GOVERNORATES: 'governorates',
  CITIES: 'cities',
  AREAS: 'areas',
  SHIPPING_COMPANIES: 'shipping-companies',
  PAYMENT_METHODS: 'payment-methods',
  PAYMENT_STATUSES: 'payment-statuses',
  CATEGORIES: 'categories',
  UTM_SOURCES: 'utm-sources',

  // Cancellation Reasons
  CANCELLATION_REASONS: 'cancellation-reasons',
  TOP_CANCELLATION_REASONS: 'top-cancellation-reasons',
} as const;

export type QueryKeyType = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
