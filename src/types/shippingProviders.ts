import type {
  ShippingCompanyKind,
  ShippingImplementation,
} from '@/types/shippingCompanies';
import type { FollowupClosure, FollowupWorkState } from '@/types/logistics';
import { OrderPrepaid, OrderStatus } from '@/types/orders';
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
  inProcessUnknownShippingCostCount?: number;
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

export const DELIVERED_STATUSES = [OrderStatus.DELIVERED, OrderStatus.COLLECTED] as const;

export type DeliveredStatus = (typeof DELIVERED_STATUSES)[number];

export type OutcomeView = 'returned' | 'delivered';

export const LATENESS_FLAGS = ['RED', 'YELLOW', 'GREEN'] as const;

export type LatenessFlag = (typeof LATENESS_FLAGS)[number];

export const LATENESS_FILTERS = ['GREEN', 'YELLOW', 'RED', 'NONE'] as const;

export type LatenessFilter = (typeof LATENESS_FILTERS)[number];

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

export type ShipmentWhatsAppTemplateType = 'SHIPMENT_CUSTOMER' | 'SHIPMENT_COURIER';

export interface ShipmentWhatsAppTemplate {
  type: ShipmentWhatsAppTemplateType;
  label: string;
  url: string;
}

export interface ShipmentRowBase {
  id: number;
  code: string;
  shippingCode: string | null;
  status: OrderStatus;
  governorate: string | null;
  city: string | null;
  totalCost: number | null;
  /** When it went to this carrier — a shipping event, not the order date. */
  takenAt: string | null;
  availableFrom: string | null;
  availableTo: string | null;
  customer: ShipmentCustomer;
  whatsappTemplates: ShipmentWhatsAppTemplate[];
  closure: FollowupClosure | null;
  governorateOption: string | null;
  cityOption: string | null;
  area: string | null;
  externalGovernorate: string | null;
  externalCity: string | null;
  address: string | null;
  returnShippingCost: number | null;
  lineCount: number;
  returnChildCode: string | null;
  frozenReturnChild: boolean;
  prepaid: OrderPrepaid | null;
  unreadNoteCount?: number;
}

export interface InProcessShipment extends ShipmentRowBase {
  lateness: LatenessInfo | null;
  courierName: string | null;
  courierPhone: string | null;
  netAmount?: string;
  shippingCostUnknown?: boolean;
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
  returnedAt: string | null;
  sendAgainEligible: boolean;
  sendAgainBlockedReason: SendAgainBlockedReason | null;
}

export interface DeliveredShipment extends ShipmentRowBase {
  lateness: null;
  courierName: string | null;
  courierPhone: string | null;
  deliveredAt: string | null;
}

export interface CarrierHeader {
  shippingCompanyId: number;
  name: string;
  phone: string | null;
  carrierSupportsUpdate: boolean;
}

export interface InProcessSummary {
  netAmount?: string;
  unknownShippingCostCount?: number;
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

export interface DeliveredShipmentsPage {
  carrier: CarrierHeader;
  summary: Record<string, never>;
  data: DeliveredShipment[];
  page: number;
  limit: number;
  total: number;
}

export interface InProcessFilters {
  from?: string;
  to?: string;
  status?: InProcessStatus;
  lateness?: LatenessFilter[];
  governorate?: string;
  city?: string;
  search?: string;
  workState: FollowupWorkState;
  page: number;
  limit: number;
}

export interface OutcomeFilters {
  from?: string;
  to?: string;
  governorate?: string;
  city?: string;
  search?: string;
  workState: FollowupWorkState;
  page: number;
  limit: number;
}

export type ReturnedFilters = OutcomeFilters;

export interface DeliveredFilters extends OutcomeFilters {
  status?: DeliveredStatus;
}

export type InProcessCountFilters = Pick<
  InProcessFilters,
  'from' | 'to' | 'status' | 'lateness' | 'governorate' | 'city' | 'search'
>;

export type OutcomeCountFilters = Omit<OutcomeFilters, 'workState' | 'page' | 'limit'>;

export interface DeliveredCountFilters extends OutcomeCountFilters {
  status?: DeliveredStatus;
}

export interface WorkStateCounts {
  open: number;
  closed: number;
  all: number;
}

export interface ShipmentCounts {
  inProcess: WorkStateCounts;
  returned: number | null;
  delivered: number | null;
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

export interface ShipmentPrepaidBody {
  prepaidAmount: number | null;
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
