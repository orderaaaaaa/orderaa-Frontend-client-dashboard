import { Order, OrderEvent, OrderProduct, OrderStatus } from './orders';
import type { CarrierSendBlock } from './manual-order';

/** Mirrors the backend GovernorateSettingResponseDto. */
export interface GovernorateLogisticsConfig {
  id: number;
  shippingCompanyId: number;
  /** Canonical Arabic label, exactly as GET /lookups/governorates returns it. */
  governorate: string;
  governorateKey: string | null;
  firstAttemptDelay: number;
  /** Decimal strings on the wire — never parse into a float. */
  shippingCost: string | null;
  nonReceiptCost: string | null;
}

export interface GovernorateLogisticsConfigRow {
  governorate: string;
  firstAttemptDelay: number;
  shippingCost: string | null;
  nonReceiptCost: string | null;
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
  order?: Partial<FollowupOrder>;
}

export interface TrackingCardsFilter {
  status?: TrackingCardStatus;
  scheduledDate?: string;
  completedDate?: string;
  page?: number;
  limit?: number;
}

export interface PartialDeliveryData {
  orderId: number;
  returnedOrderProductIds: number[];
  adjustedTotalCost?: number;
  returnShipmentContent?: string;
}

export interface PartialDeliveryOrderSummary {
  id: number;
  code: string;
  status: OrderStatus;
  totalCost: number;
}

export interface PartialDeliveryResponse {
  baseOrder: PartialDeliveryOrderSummary;
  returnOrder: PartialDeliveryOrderSummary;
  movedOrderProductIds: number[];
  carrierSend: CarrierSendBlock | null;
}

export interface ExchangeData {
  orderId: number;
  returnedOrderProductId: number;
  newProductId: number;
  newVariants: { label: string; value: string }[];
  priceDifference: number;
}

export const REFUND_METHODS = ['CASH', 'BANK_TRANSFER', 'E_WALLET', 'OTHER'] as const;

export type RefundMethod = (typeof REFUND_METHODS)[number];

export interface ReturnRefundData {
  orderId: number;
  returnedOrderProductId: number;
  amount: number;
  refundMethod: RefundMethod;
  reasonId: number;
}

export interface ReturnRefundResponse {
  success: boolean;
  eventId: number;
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

export type FollowupClosureKind = 'CLOSED_TODAY' | 'REFUSE' | 'CANCEL';

export interface FollowupClosure {
  kind: FollowupClosureKind;
  reasonId: number | null;
  reasonName: string | null;
  reasonText: string | null;
  notes: string | null;
  closedAt: string;
  closedByEmployeeId: number | null;
  carrierHoldsParcel: boolean;
}

export const FOLLOWUP_WORK_STATES = ['open', 'closed', 'all'] as const;

export type FollowupWorkState = (typeof FOLLOWUP_WORK_STATES)[number];

export interface FollowupOrder extends Order {
  shippingEvents?: FollowupOrderEvent[];
  followupEvents?: FollowupOrderEvent[];
  firstAttemptAt?: string | null;
  delegateName?: string | null;
  delegatePhone?: string | null;
  closure?: FollowupClosure | null;
}

export type FollowupTab = 'NEW_ORDERS' | 'OVERDUE' | 'EXECUTED';

export interface FollowupFilters {
  page?: number;
  limit?: number;
  search?: string;
  orderByDirection?: 'asc' | 'desc';
  newFirst?: boolean;
  shippingCompanyId?: string;
  governorate?: string;
  city?: string;
  code?: string;
  createdAfter?: string;
  createdBefore?: string;
  customerName?: string;
  customerPhone?: string;
  productName?: string;
  shippingStatuses?: string[];
  workState?: FollowupWorkState;
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
