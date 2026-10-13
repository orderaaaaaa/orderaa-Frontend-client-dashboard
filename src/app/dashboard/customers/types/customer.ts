export type CustomerBadge = 'ghost' | 'window' | 'high' | 'bulk' | 'loyal';

export type CustomerBadgeFilter = CustomerBadge | 'none';

export type CustomerSegment = 'all' | 'premium';

export interface CustomerCurrentBlock {
  reason: string | null;
  blockedAt: string;
  blockedUntil: string | null;
}

export interface CustomerBlockEntry {
  id: number;
  reason: string | null;
  blockedUntil: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  code: string;
  status: string;
  totalCost: number;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phoneNumbers: string[];
  email?: string;
  numberOfOrders: number;
  latestOrder?: Order;
  totalAmount: number;
  notes: string[];
  isBlocked: boolean;
  currentBlock: CustomerCurrentBlock | null;
  createdAt: string;
  updatedAt: string;
  badge: CustomerBadge | null;
  deliveredCount: number;
  returnedCount: number;
  cancelledCount: number;
  deliveredValue: number;
}

export interface CustomerDetailOrderProduct {
  id: number;
}

export interface CustomerDetailOrder extends Order {
  notes: string | null;
  order_products: CustomerDetailOrderProduct[];
}

export interface CustomerDetail {
  id: number;
  name: string;
  phoneNumbers: string[];
  email?: string;
  numberOfOrders: number;
  latestOrder: Order | null;
  totalAmount: number;
  notes: string[];
  isBlocked: boolean;
  currentBlock: CustomerCurrentBlock | null;
  blockHistory: CustomerBlockEntry[];
  createdAt: string;
  updatedAt: string;
  orders: CustomerDetailOrder[];
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: PaginationMeta;
}

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  isBlocked?: boolean;
  latestOrderStatus?: string;
  badge?: CustomerBadgeFilter;
  segment?: CustomerSegment;
}

export interface CustomerBadgeThresholds {
  highValueMinDelivered: number;
  bulkMinAvgPieces: number;
  loyalMinDelivered: number;
  loyalMinSuccessPercent: number;
  ghostMinReturns: number;
  windowMinOrders: number;
  windowMinCancelled: number;
}

export interface CustomerBadgeSettings {
  thresholds: CustomerBadgeThresholds;
  enabledBadges: CustomerBadge[];
  isDefault: boolean;
}

export interface UpdateCustomerBadgeSettingsPayload {
  thresholds?: Partial<CustomerBadgeThresholds>;
  enabledBadges?: CustomerBadge[];
}

export interface CustomerBadgeCounts {
  total: number;
  loyal: number;
  bulk: number;
  ghost: number;
  window: number;
  high: number;
  none: number;
  premium: number;
}
