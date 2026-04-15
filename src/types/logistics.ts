import { Order, OrderProduct } from './orders';

export interface GovernorateLogisticsConfig {
  id: number;
  shippingCompanyId: number;
  shippingCompanyName: string;
  governorateKey: string;
  governorateName: string;
  firstAttemptAfterDays: number;
  shippingCompanyCost: number;
  nonReceiptCost: number;
  createdAt: string;
  updatedAt: string;
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
  agentStatus?: TrackingAgentStatus | null;
  agentFlag?: AgentFlag | null;
  agentNote?: string | null;
  postponedUntil?: string | null;
  completedAt?: string | null;
  employeeId?: number | null;
  employeeName?: string | null;
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

export const POST_SHIPPING_STATUSES = new Set([
  'WAITING_FOR_APPROVAL',
  'SHIPPING',
  'WITH_DRIVER',
  'RETURNED_DELIVERED',
  'DELIVERED',
  'PARTIAL_DELIVERY',
  'MISSING',
]);
