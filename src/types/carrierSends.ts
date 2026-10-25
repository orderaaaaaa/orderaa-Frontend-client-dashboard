import type {
  CarrierRejectKind,
  CarrierSendOperation,
  CarrierUnknownReason,
  OrderSystemFailureCode,
} from '@/types/orderSystemFailures';
import type { ShippingImplementation } from '@/types/shippingCompanies';

export type CarrierSendState =
  | 'PENDING'
  | 'SEND_ATTEMPTED'
  | 'SENT'
  | 'REJECTED'
  | 'UNKNOWN'
  | 'CLOSED_NONE';

export type CarrierSendBlock = {
  markerId: number;
  state: CarrierSendState;
  notCalled: boolean;
  held: boolean;
  carrierCode: ShippingImplementation;
  carrierShippingId: string | null;
  carrierText: string | null;
  rowCode: string | null;
};

export type CarrierSendCallKind = 'ADD' | 'UPDATE';

export type CarrierSendCloseKind = 'SHIPMENT_RECORDED' | 'NONE' | 'GUARD_CHANGED';

export type CarrierSendCloseChoice = 'SHIPMENT_RECORDED' | 'NONE';

export interface CarrierSendView {
  id: number;
  orderId: number;
  orderCode: string;
  operation: CarrierSendOperation;
  callKind: CarrierSendCallKind;
  state: CarrierSendState;
  held: boolean;
  targetCarrier: ShippingImplementation;
  targetCompanyId: number;
  carrierShippingId: string | null;
  unknownReason: CarrierUnknownReason | null;
  rejectKind: CarrierRejectKind | null;
  closeKind: CarrierSendCloseKind | null;
  stale: boolean;
  createdAt: string;
  claimedAt: string | null;
  closedAt: string | null;
  closedBy: { id: number; name: string } | null;
}

export interface CarrierSendSettlement {
  markerId: number;
  state: CarrierSendState;
  notCalled: boolean;
  carrierCode: ShippingImplementation;
  carrierShippingId: string | null;
  carrierText: string | null;
  rowCode: OrderSystemFailureCode | null;
  unknownReason: CarrierUnknownReason | null;
  rejectKind: CarrierRejectKind | null;
}

export interface CarrierSendOrderBlock {
  id: number;
  status: string;
  shippingCompanyId: number | null;
  activeShippingId: string | null;
}

export interface CarrierSendOpenPage {
  data: CarrierSendView[];
  nextCursor: string | null;
}

export interface CarrierSendListResponse {
  data: CarrierSendView[];
}

export interface CloseCarrierSendResponse {
  marker: CarrierSendView;
  order: CarrierSendOrderBlock;
}

export interface DispatchCarrierSendResponse {
  marker: CarrierSendView;
  settlement: CarrierSendSettlement;
}

export interface SendAgainCarrierSendResponse {
  marker: CarrierSendView;
  settlement: CarrierSendSettlement;
  released: boolean;
}

export interface SuccessResponse {
  success: true;
}

export type CarrierSendErrorCode =
  | 'CARRIER_SEND_OPEN'
  | 'CARRIER_SEND_HELD'
  | 'CARRIER_SEND_NOT_FOUND'
  | 'CARRIER_SEND_NOT_OPEN'
  | 'CARRIER_SEND_IN_FLIGHT'
  | 'CARRIER_SEND_NOT_PENDING'
  | 'CARRIER_SEND_NOT_RESENDABLE';

export type ShippingSwitchMissingField = 'governorate' | 'city' | 'phone';

export interface CarrierSendOpenErrorBody {
  code: 'CARRIER_SEND_OPEN';
  openMarkerId?: number;
}

export interface ShippingSwitchMissingFieldsErrorBody {
  code: 'SHIPPING_SWITCH_MISSING_FIELDS';
  missing: ShippingSwitchMissingField[];
}

export interface CarrierSendBearingResponse {
  carrierSend?: CarrierSendBlock | null;
}
