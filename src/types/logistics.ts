import { Order, OrderEvent, OrderProduct } from './orders';

/** Mirrors the backend GovernorateSettingResponseDto. */
export interface GovernorateLogisticsConfig {
  id: number;
  shippingCompany: string;
  /** Canonical Arabic label, exactly as GET /lookups/governorates returns it. */
  governorate: string;
  firstAttemptDelay: number;
  /** Decimal strings on the wire — never parse into a float. */
  shippingCost: string;
  nonReceiptCost: string;
}

export interface GovernorateLogisticsConfigRow {
  governorate: string;
  firstAttemptDelay: number;
  shippingCost: string;
  nonReceiptCost: string;
}

export type TrackingCardType = 'COURIER' | 'CALL_CENTER';

export type TrackingCardStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'PAUSED'
  | 'CANCELLED';

export type TrackingAgentStatus =
  | 'CLOSED'
  | 'NO_ANSWER'
  | 'NOT_COLLECTING'
  | 'BUSY'
  | 'POSTPONE';

export type AgentFlag = 'CORRECT' | 'FAKE';

export type ShippingPointType = 'CORRECT' | 'FAKE';

export interface TrackingCard {
  id: number;
  orderId: number;
  orderCode: string;
  type: TrackingCardType;
  scheduledDate: string;
  status: TrackingCardStatus;
  courierUpdate?: string | null;
  courierName?: string | null;
  courierPhone?: string | null;
  agentStatus?: string | null;
  agentFlag?: AgentFlag | null;
  agentNote?: string | null;
  agentEventAt?: string | null;
  postponedUntil?: string | null;
  completedAt?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
  shippingEventId?: number | null;
  createdAt: string;
  updatedAt: string;
  order?: Partial<Order>;
}

export interface TrackingCardsFilter {
  status?: TrackingCardStatus;
  scheduledDate?: string;
  completedDate?: string;
  page?: number;
  limit?: number;
}

export interface PostShippingReason {
  id: number;
  reasonName: string;
  type: 'POST_SHIPPING';
  isActive: boolean;
  displayOrder: number;
  usageCount: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCancellationReason {
  id: number;
  reasonName: string;
  type: 'SHIPPING_CANCELLATION';
  isActive: boolean;
  displayOrder: number;
  usageCount: number;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PartialDeliveryData {
  orderId: number;
  returnedOrderProductIds: number[];
  adjustedTotalCost: number;
}

export interface ExchangeData {
  orderId: number;
  returnedOrderProductId: number;
  newProductId: number;
  newVariants: { label: string; value: string }[];
  priceDifference: number;
}

export interface ReturnRefundData {
  orderId: number;
  returnedOrderProductId: number;
  amount: number;
  reasonId: number;
}

export interface OrderProductChangeLog {
  id: number;
  orderId: number;
  changeType: 'MODIFY_VARIANT' | 'SWAP_PRODUCT';
  oldProductId: number;
  oldProductName: string;
  oldVariants: { label: string; value: string }[];
  newProductId: number;
  newProductName: string;
  newVariants: { label: string; value: string }[];
  employeeId: number;
  employeeName: string;
  priceDifference: number;
  createdAt: string;
}

export interface UpdateTrackingCardData {
  agentStatus?: TrackingAgentStatus;
  agentFlag?: AgentFlag;
  agentNote?: string;
  postponedUntil?: string;
  courierUpdate?: string;
  action?: string;
  actionNote?: string;
  deliveryDate?: string;
  cancelReasonId?: number;
  newProductId?: number;
  newVariants?: { label: string; value: string }[];
}

export type FollowupEventType = 'FOLLOWUP' | 'SHIPPING_WEBHOOK' | 'SYSTEM';

export type FollowupStatusName =
  | 'ATTEMPTED'
  | 'POSTPONED'
  | 'CHANGE_PRODUCTS'
  | 'SEND_AGAIN'
  | 'CANCELLED'
  | 'OVERDUE';

export interface FollowupOrderEvent extends OrderEvent {
  type?: FollowupEventType;
}

export interface FollowupOrder extends Order {
  shippingEvents?: FollowupOrderEvent[];
  followupEvents?: FollowupOrderEvent[];
  firstAttemptAt?: string | null;
  delegateName?: string | null;
  delegatePhone?: string | null;
}

export type FollowupTab = 'NEW_ORDERS' | 'OVERDUE' | 'EXECUTED';

export interface FollowupFilters {
  page?: number;
  limit?: number;
  search?: string;
  orderByDirection?: 'asc' | 'desc';
  newFirst?: boolean;
  shippingCompany?: string;
  governorate?: string;
  city?: string;
  code?: string;
  createdAfter?: string;
  createdBefore?: string;
  customerName?: string;
  customerPhone?: string;
  productName?: string;
  shippingStatuses?: string[];
}

export const POST_SHIPPING_STATUSES = new Set([
  'WAITING_FOR_APPROVAL',
  'SHIPPING',
  'WITH_DRIVER',
  'RETURNED_DELIVERED',
  'DELIVERED',
  'PARTIAL_DELIVERY',
  'MISSING',
]);
