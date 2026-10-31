import type {
  ShippingCompanyKind,
  ShippingImplementation,
} from '@/types/shippingCompanies';
import type { FollowupClosure, FollowupWorkState } from '@/types/logistics';
import { OrderStatus } from '@/types/orders';
import type { CarrierSendBearingResponse } from '@/types/carrierSends';
import type { CarrierCapabilityReason } from '@/types/shippingCompanies';

/** Mirrors the backend shipping-provider DTOs (T16). */

export type ShippingProviderType = 'COMPANY' | 'DELEGATE';

export interface ShippingProvider {
  id: number;
  shippingCompanyId: number;
  type: ShippingProviderType;
  name: string;
  phone: string | null;
  isActive: boolean;
}

export interface CarrierStats {
  key: string;
  shippingCompanyId: number;
  kind: ShippingCompanyKind;
  implementation: ShippingImplementation;
  type: ShippingProviderType | null;
  name: string;
  phone: string | null;
  isActive: boolean;
  inTransitCount: number;
  deliveredCount: number;
  returnedCount: number;
  totalAssigned: number;
  /** NULL — never 0 — when nothing has finished yet. */
  deliveryRate: number | null;
  returnRate: number | null;
  inProcessNetAmount?: string;
}

export interface LocationStats {
  location: string | null;
  deliveredCount: number;
  returnedCount: number;
  deliveryRate: number | null;
  returnRate: number | null;
}

export interface StatsRange {
  from?: string;
  to?: string;
}

export const IN_PROCESS_STATUSES = [
  OrderStatus.WAITING_FOR_APPROVAL,
  OrderStatus.SHIPPING,
  OrderStatus.WITH_DRIVER,
] as const;

export type InProcessStatus = (typeof IN_PROCESS_STATUSES)[number];

export const LATENESS_FLAGS = ['RED', 'YELLOW', 'GREEN'] as const;

export type LatenessFlag = (typeof LATENESS_FLAGS)[number];

export const LATE_MARK_KINDS = ['LATE', 'ON_TIME', 'AUTO'] as const;

export type LateMarkKind = (typeof LATE_MARK_KINDS)[number];

export type LatenessOverride = Exclude<LateMarkKind, 'AUTO'>;

export interface LatenessInfo {
  flag: LatenessFlag | null;
  daysLate: number | null;
  dueDay: string | null;
  override: LatenessOverride | null;
}

export interface ShipmentCustomer {
  name: string | null;
  phones: string[];
}

export interface ShipmentRowBase {
  id: number;
  code: string;
  status: OrderStatus;
  governorate: string | null;
  city: string | null;
  totalCost: number | null;
  /** When it went to this carrier — a shipping event, not the order date. */
  takenAt: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  customer: ShipmentCustomer;
  closure: FollowupClosure | null;
  governorateOption: string | null;
  cityOption: string | null;
  area: string | null;
  address: string | null;
  returnShippingCost: number | null;
}

export interface InProcessShipment extends ShipmentRowBase {
  lateness: LatenessInfo | null;
  courierName: string | null;
  courierPhone: string | null;
  netAmount?: string;
}

export type SendAgainBlockedReason =
  | 'NOT_TURBO'
  | 'NOT_RETURNED_DELIVERED'
  | 'NO_ACTIVE_CODE'
  | 'NO_CARRIER_STATUS'
  | 'RETURNED_TO_MERCHANT';

export type SendAgainCarrierResend =
  | { attempted: false; reason: CarrierCapabilityReason | null }
  | { attempted: true; state: 'SENT' | 'REJECTED' | 'UNKNOWN' };

export interface SendAgainRecordResponse {
  success: true;
  carrierResend: SendAgainCarrierResend;
}

export interface SendAgainNotEligibleErrorBody {
  statusCode: number;
  code: 'SEND_AGAIN_NOT_ELIGIBLE';
  reason: SendAgainBlockedReason;
  message: string;
}

export interface ReturnedShipment extends ShipmentRowBase {
  lateness: null;
  courierName: string | null;
  courierPhone: string | null;
  sendAgainEligible: boolean;
  sendAgainBlockedReason: SendAgainBlockedReason | null;
}

export interface CarrierHeader {
  shippingCompanyId: number;
  name: string;
  phone: string | null;
  carrierSupportsUpdate: boolean;
}

export interface InProcessSummary {
  netAmount?: string;
}

export interface InProcessShipmentsPage {
  carrier: CarrierHeader;
  summary: InProcessSummary;
  data: InProcessShipment[];
  page: number;
  limit: number;
  total: number;
}

export interface ReturnedShipmentsPage {
  carrier: CarrierHeader;
  summary: Record<string, never>;
  data: ReturnedShipment[];
  page: number;
  limit: number;
  total: number;
}

export interface InProcessFilters {
  from?: string;
  to?: string;
  status?: InProcessStatus;
  governorate?: string;
  city?: string;
  search?: string;
  workState: FollowupWorkState;
  page: number;
  limit: number;
}

export interface ReturnedFilters {
  page: number;
  limit: number;
}

export type InProcessCountFilters = Pick<
  InProcessFilters,
  'from' | 'to' | 'status' | 'governorate' | 'city' | 'search'
>;

export interface ShipmentCounts {
  inProcess: { open: number; closed: number; all: number };
  returned: number | null;
}

export interface LateMarkBody {
  kind: LateMarkKind;
  note?: string;
}

export interface LateMarkResponse {
  orderId: number;
  lateness: LatenessInfo | null;
}

export interface DeliveryWindowBody {
  availableFrom: string | null;
  availableTo: string | null;
}

export interface DeliveryWindowResponse {
  orderId: number;
  availableFrom: string | null;
  availableTo: string | null;
}

export interface ShipmentAddressBody {
  governorate?: string;
  city?: string;
  governorateOption?: string;
  cityOption?: string;
  area?: string;
  address?: string;
}

export interface ShipmentPriceBody {
  totalCost: number;
}

export interface ShipmentReturnCostBody {
  returnShippingCost: number;
}

export interface ShipmentCustomerPhoneBody {
  phoneNumber: string;
}

export interface ShipmentCustomerPhoneResponse extends CarrierSendBearingResponse {
  customerId: number;
}
