import { OrderStatus, ShippingType } from './orders';
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

export interface GovernorateWeekendDays {
  weekendDays: number[];
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

export interface PartialUndoPreview {
  childCode: string;
  totalBefore: number;
  totalAfter: number;
  totalBeforeSplit: number | null;
  path: 'IN_TRANSIT' | 'DELIVERED';
  shippingTypeBefore: ShippingType;
  shippingTypeAfter: ShippingType;
  carrierHoldsSplitValues: boolean;
}

export interface PartialUndoResponse {
  parentOrder: {
    id: number;
    code: string;
    status: OrderStatus;
    totalCost: number;
    shippingType: ShippingType;
  };
  removedReturnOrder: { id: number; code: string };
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
  returnedOrderProductId?: number;
  returnedOrderProductIds?: number[];
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

export const POST_SHIPPING_STATUSES = new Set([
  'WAITING_FOR_APPROVAL',
  'SHIPPING',
  'WITH_DRIVER',
  'RETURNED_DELIVERED',
  'RETURNED_COLLECTED',
  'COLLECTED',
  'RETURNED_SETTLED',
  'RETURNED_FINAL',
  'DELIVERED',
  'MISSING',
]);
