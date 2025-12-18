/**
 * Query keys for React Query
 * Centralized query key management for cache invalidation
 */
export const QUERY_KEYS = {
  // Orders
  ORDERS: 'orders',
  ORDER_DETAILS: 'order-details',
  ORDER_STATISTICS: 'order-statistics',
  ORDER_FILTER_OPTIONS: 'order-filter-options',
  ORDER_STATUSES: 'order-statuses',
  CUSTOMER_ORDERS: 'customer-orders',

  // Products
  PRODUCTS: 'products',
  PRODUCT_VARIANTS_OPTIONS: 'product-variants-options',

  // Lookups
  GOVERNORATES: 'governorates',
  CITIES: 'cities',
  AREAS: 'areas',
} as const;

export type QueryKeyType = (typeof QUERY_KEYS)[keyof typeof QUERY_KEYS];
