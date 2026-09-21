import type { OrderStatus } from '@/types/orders';
import type { ManualOrderPayload } from '@/types/manual-order';

export type MissingOrderStatus = 'OPEN' | 'RECOVERED' | 'DISMISSED';

export type MissingOrderStatusFilter = MissingOrderStatus | 'ALL';

export type MissingOrderFormat = 'APP' | 'EASYORDER' | 'SHOPIFY';

export type MissingOrderFailureCode =
  | 'INVALID_PAYLOAD'
  | 'MISSING_EXTERNAL_ID'
  | 'UNKNOWN_PROVIDER'
  | 'STORE_NOT_FOUND'
  | 'PRODUCT_UNRESOLVED'
  | 'VARIANT_REQUIRED'
  | 'VARIANT_OPTIONS_INVALID'
  | 'VARIANT_DUPLICATE_ATTRIBUTE'
  | 'VARIANT_INCOMPLETE'
  | 'TIMEOUT'
  | 'TRANSIENT_EXHAUSTED'
  | 'STALE_RUNNING'
  | 'STALE_PENDING'
  | 'INTERNAL';

export type OrderPaymentStatus = 'PAID' | 'CASH_ON_DELIVERY' | 'PARTIALLY_PAID';

export interface MissingOrderRecoveredOrderRef {
  id: number;
  code: string;
}

export interface MissingOrderHandledBy {
  id: number;
  name: string | null;
}

export interface MissingOrderListItem {
  id: number;
  status: MissingOrderStatus;
  providerParam: string;
  format: MissingOrderFormat | null;
  externalOrderId: string | null;
  customerName: string | null;
  phone: string | null;
  altPhone: string | null;
  failureCode: MissingOrderFailureCode;
  failureCount: number;
  createdAt: string;
  lastFailedAt: string;
  recoveredOrder: MissingOrderRecoveredOrderRef | null;
  handledBy: MissingOrderHandledBy | null;
}

export interface MissingOrderPrefillVariant {
  attribute: string | null;
  option: string | null;
}

export interface MissingOrderPrefillProduct {
  index: number;
  name: string | null;
  sku: string | null;
  quantity: number | null;
  price: number | null;
  productId: number | null;
  productName: string | null;
  image: string | null;
  variants: MissingOrderPrefillVariant[];
  attributeOptionIds: number[] | null;
  failing: boolean;
}

export interface MissingOrderDetail extends MissingOrderListItem {
  storeId: number | null;
  address: string | null;
  governorateText: string | null;
  cityText: string | null;
  notes: string | null;
  utmSource: string | null;
  paymentStatus: OrderPaymentStatus | null;
  prepaidAmount: string | null;
  failureProductIndex: number | null;
  dismissReason: string | null;
  handledAt: string | null;
  diagnostic: string | null;
  rawPayload: unknown;
  products: MissingOrderPrefillProduct[];
}

export interface MissingOrdersPage {
  data: MissingOrderListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface MissingOrdersListFilters {
  status?: MissingOrderStatusFilter;
  format?: 'EASYORDER' | 'SHOPIFY';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export type RecoverMissingOrderPayload = ManualOrderPayload & {
  paymentStatus: OrderPaymentStatus;
  prepaidAmount: number | null;
};

export interface RecoverMissingOrderResponse {
  id: number;
  code: string;
  status: OrderStatus;
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  shippingCost: number;
  createdAt: string;
  missingOrderId: number;
}

export interface MissingOrderErrorBody {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  status?: MissingOrderStatus;
  orderId?: number;
  orderCode?: string;
}
