import type { ShippingImplementation } from '@/types/shippingCompanies';

export type OrderSystemFailureSource =
  | 'CARRIER_WEBHOOK'
  | 'SHIPPING_DISPATCH'
  | 'AUTOMATION'
  | 'STOCK_WORKFLOW'
  | 'SCHEDULED_JOB'
  | 'BILLING'
  | 'INTEGRATION_ORDER_UPDATE';

export type CarrierWebhookFailureCode =
  | 'CARRIER_STATUS_UNMAPPED'
  | 'CARRIER_STATUS_IGNORED_STALE'
  | 'CARRIER_STATUS_IGNORED_PARTIAL_RETURN'
  | 'CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW'
  | 'CARRIER_STATUS_NOT_APPLIED'
  | 'CARRIER_CANCELLED_LANE_APPLIED'
  | 'CARRIER_CANCELLED_LANE_STOCK'
  | 'CARRIER_STATUS_CORRECTED'
  | 'CARRIER_RETURN_AT_MERCHANT'
  | 'CARRIER_MESSAGE_AFTER_SWITCH';

export type ShippingDispatchFailureCode =
  | 'SHIPMENT_NOT_CREATED_MISSING_ADDRESS'
  | 'SHIPMENT_NOT_CREATED_MISSING_PHONE'
  | 'SHIPMENT_DISPATCH_FAILED'
  | 'SHIPMENT_UPDATE_NOT_SENT'
  | 'SHIPMENT_OUTCOME_UNKNOWN'
  | 'OLD_SHIPMENT_STILL_LIVE';

export type AutomationFailureCode =
  | 'AUTOMATION_NOT_SENT'
  | 'AUTOMATION_SEND_FAILED'
  | 'AUTOMATION_MAPPING_NOT_SAVED'
  | 'AUTOMATION_RESULT_NOT_APPLIED'
  | 'AUTOMATION_STATUS_NOT_APPLIED';

export type StoreUpdateNotAppliedCode =
  | 'STORE_UPDATE_NOT_NEW'
  | 'STORE_UPDATE_UNMAPPED_VARIANT'
  | 'STORE_UPDATE_EMPLOYEE_EDITED'
  | 'STORE_UPDATE_NO_CREATION_BASELINE'
  | 'STORE_UPDATE_CREATION_STOCK_SHORTAGE';

export type OrderSystemFailureCode =
  | CarrierWebhookFailureCode
  | ShippingDispatchFailureCode
  | AutomationFailureCode
  | 'STOCK_MOVEMENT_SKIPPED'
  | 'STOCK_MOVEMENT_BYPASSED'
  | 'STOCK_MOVEMENT_ALL_BYPASSED'
  | 'STOCK_TRANSITION_BLOCKED'
  | 'MACHINE_TRANSITION_STOCK_SHORTAGE'
  | 'STORE_CREATE_CREATION_STOCK_SHORTAGE'
  | 'SCHEDULED_TRANSITION_FAILED'
  | 'ORDER_SHADOWED'
  | 'SHADOW_ACTIVATION_FAILED'
  | StoreUpdateNotAppliedCode
  | 'STORE_UPDATE_FAILED';

export type FailureActorType =
  | 'EMPLOYEE'
  | 'SYSTEM'
  | 'WEBHOOK'
  | 'CRON'
  | 'PLATFORM';

export type FailureReasonKind =
  | 'STOCK_SHORTAGE'
  | 'CARRIER_REJECTED'
  | 'REJECTED'
  | 'UNEXPECTED';

export type StockShortageCode =
  | 'INSUFFICIENT_STOCK_FOR_VARIANT'
  | 'ADJUSTMENT_BELOW_ZERO'
  | 'TRANSFER_INSUFFICIENT_STOCK'
  | 'OUTBOUND_INSUFFICIENT_STOCK';

export interface FailureStockShortageLine {
  variantId: number;
  warehouseId?: number;
  warehouseName?: string;
  productName: string;
  variantLabel: string;
  required: number;
  available: number;
}

export interface FailureStockShortageBlock {
  warehouseId: number | null;
  warehouseName?: string;
  lines: FailureStockShortageLine[];
}

export interface FailureStockShortage {
  code: StockShortageCode;
  blocks: FailureStockShortageBlock[];
}

export type FailureReason =
  | ({ kind: 'STOCK_SHORTAGE' } & FailureStockShortage)
  | { kind: 'CARRIER_REJECTED'; operation: string; carrierText: string }
  | { kind: 'REJECTED'; errorCode: string }
  | { kind: 'UNEXPECTED'; errorName: string; message: string };

export type ShipmentDispatchFailureReason =
  | FailureReason
  | { kind: 'RETIRED_INTEGRATION' };

export interface CarrierFailureDetailsBase {
  carrier: string;
  rawStatus: string;
}

export type CarrierStatusUnmappedDetails = CarrierFailureDetailsBase;

export interface CarrierStatusIgnoredStaleDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
  currentStatus: string | null;
}

export interface CarrierStatusIgnoredPartialReturnDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
}

export interface CarrierStatusIgnoredOutsideWindowDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
  currentStatus: string | null;
}

export interface CarrierStatusNotAppliedDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
  reason: FailureReason;
}

export interface CarrierCancelledLaneAppliedDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
  cancelReason: string | null;
}

export interface CancelledLaneMovedLine {
  productName: string;
  variantLabel: string;
  ruleId: number;
  fromWarehouseName: string | null;
  toWarehouseName: string | null;
  quantity: number;
}

export interface CancelledLaneUnmovedLine {
  productName: string;
  variantLabel: string;
  warehouseName: string | null;
}

export interface CancelledLaneTrialSkippedLine {
  productName: string;
  variantLabel: string;
}

export interface CarrierCancelledLaneStockDetails
  extends CarrierFailureDetailsBase {
  incomingStatus: string;
  fromStatus: string;
  moved: CancelledLaneMovedLine[];
  unmoved: CancelledLaneUnmovedLine[];
  trialSkipped?: CancelledLaneTrialSkippedLine[];
}

export interface CarrierStatusCorrectedDetails
  extends CarrierFailureDetailsBase {
  fromStatus: string;
  toStatus: string;
}

export type CarrierReturnAtMerchantDetails = CarrierFailureDetailsBase;

export type ShipmentMissingAddressField = 'governorate' | 'city';

export interface ShipmentMissingAddressDetails {
  missing: ShipmentMissingAddressField[];
  switchDeactivated: boolean;
}

export interface ShipmentMissingPhoneDetails {
  switchDeactivated: boolean;
}

export interface ShipmentDispatchFailedDetails {
  trigger: 'PARKED_RELEASE';
  companyName?: string;
  reason: ShipmentDispatchFailureReason;
}

export type CarrierSendOperation =
  | 'EDIT'
  | 'SWITCH'
  | 'BULK_SWITCH'
  | 'CREATION'
  | 'MISSING_ORDER_RECOVERY'
  | 'FOLLOWUP_CHILD'
  | 'PARKED_RELEASE'
  | 'HELD_ACTIVATION'
  | 'BULK_CONFIRM'
  | 'SUBMIT_FOR_APPROVAL';

export type CarrierUnknownReason =
  | 'TIMEOUT'
  | 'DEADLINE'
  | 'NO_RESPONSE'
  | 'SERVER_ERROR'
  | 'UNPARSEABLE'
  | 'SUCCESS_WITHOUT_ID'
  | 'ID_WRITE_FAILED'
  | 'STALE_ATTEMPT'
  | 'UNCLASSIFIED';

export type CarrierRejectKind = 'EXPLICIT' | 'NOT_DISPATCHED' | 'UNSUPPORTED_OPERATION';

export type CarrierSendRowReason =
  | CarrierUnknownReason
  | CarrierRejectKind
  | 'GUARD_CHANGED'
  | 'PREVIOUS_SEND_OPEN'
  | 'HELD_CHECK_REQUIRED';

export interface ShipmentCarrierSendDetails {
  carrier: ShippingImplementation;
  carrierCompanyId: number;
  markerId: number;
  operation: CarrierSendOperation;
  reason: CarrierSendRowReason;
  carrierText: string | null;
  oldShippingId: string | null;
  sourceCarrier?: ShippingImplementation | null;
}

export interface CarrierMessageAfterSwitchDetails {
  carrier: ShippingImplementation;
  carrierName: string;
  oldCompanyId: number;
  shippingId: string;
}

export interface OldShipmentStillLiveDetails {
  oldCompanyId: number;
  newCompanyId: number;
  shippingId: string;
}

export type ShipmentUpdateNotSentDetails = ShipmentCarrierSendDetails;

export type ShipmentOutcomeUnknownDetails = ShipmentCarrierSendDetails;

export type AutomationNotSentReason = 'NO_API_KEY' | 'NO_STRATEGY';

export type AutomationMappingNotSavedReason =
  | 'NO_EXTERNAL_ID'
  | 'INSERT_FAILED';

export interface AutomationNotSentDetails {
  provider: string;
  reason: AutomationNotSentReason;
}

export interface AutomationSendFailedDetails {
  provider: string;
  httpStatus: number | null;
  providerMessage: string | null;
}

export interface AutomationMappingNotSavedDetails {
  provider: string;
  reason: AutomationMappingNotSavedReason;
}

export interface AutomationResultNotAppliedDetails {
  provider: string;
  feedbackLabel: string;
  feedbackSummary: string;
  orderStatus: string;
}

export interface AutomationStatusNotAppliedDetails {
  provider: string;
  targetStatus: string;
  reason: FailureReason;
  feedbackLabel?: string;
  feedbackSummary?: string;
  stockLines?: FailureStockShortageLine[];
  stockSummary?: string;
}

export interface StockMovementSkippedDetails {
  fromStatus: string | null;
  toStatus: string;
  variantIds: number[];
  variantIdsTruncatedCount?: number;
}

export interface StockMovementBypassedLine {
  variantId: number;
  productName: string;
  variantLabel: string;
  fromWarehouseName: string | null;
  ruleId: number;
  predecessorKeys: string[];
}

export interface StockMovementBypassedDetails {
  fromStatus: string | null;
  toStatus: string;
  appliedVariantIds: number[];
  lines: StockMovementBypassedLine[];
}

export interface StockMovementAllBypassedDetails {
  fromStatus: string | null;
  toStatus: string;
  lines: StockMovementBypassedLine[];
}

export interface StockTransitionBlockedDetails {
  fromStatus: string;
  toStatus: string;
  ruleId: number | null;
  warehouseName: string | null;
  lines: FailureStockShortageLine[];
}

export type MachineShortageJob =
  | 'SCHEDULED'
  | 'VROBO'
  | 'PARKED_RELEASE'
  | 'SHADOW_RELEASE';

export interface MachineTransitionStockShortageDetails {
  job: MachineShortageJob;
  fromStatus: string | null;
  intendedStatus: string;
}

export interface StoreCreateCreationStockShortageDetails {
  targetStatus: string;
  lines: FailureStockShortageLine[];
}

export type ScheduledTransitionJob = 'RESET_ATTEMPTED' | 'POSTPONED_DUE';

export interface ScheduledTransitionFailedDetails {
  job: ScheduledTransitionJob;
  targetStatus: string;
  reason: FailureReason;
}

export type OrderShadowedReason = 'NO_PRICING' | 'INSUFFICIENT_BALANCE';

export interface OrderShadowedDetails {
  reason: OrderShadowedReason;
  price?: number | string;
}

export interface ShadowActivationFailedDetails {
  reason: FailureReason;
}

export type FailureMoney = number | string | null;

export interface StoreUpdateLine {
  title: string | null;
  externalVariantId: string | null;
  productId: number | null;
  variantId: number | null;
  price: FailureMoney;
  quantity: number;
  sku: string | null;
  customVariants: unknown;
}

export interface StoreUpdateSnapshot {
  lines: StoreUpdateLine[];
  money: {
    totalCost: FailureMoney;
    shippingCost: FailureMoney;
    couponDiscount: FailureMoney;
    paymentMethod: string | null;
    paymentStatus: string | null;
    prepaidAmount: FailureMoney;
  };
  customer: {
    name: string | null;
    phone: string | null;
    altPhone: string | null;
    email: string | null;
  };
  address: {
    address: string | null;
    governorate: string | null;
    city: string | null;
    externalGovernorate: string | null;
    externalCity: string | null;
    returnShippingCost: FailureMoney;
  };
  notes: string | null;
}

export type StoreUpdateNotAppliedReason =
  | { status: string }
  | {
      unmapped: {
        index: number;
        externalVariantId: string | null;
        title: string | null;
      };
    }
  | { differences: string[] }
  | { shortage: FailureStockShortage | null }
  | Record<string, never>;

export interface StoreUpdateNotAppliedDetails {
  provider: string;
  externalOrderId: string | null;
  webhookLogId: number | null;
  event: string | null;
  update: StoreUpdateSnapshot;
  reason: StoreUpdateNotAppliedReason;
}

export interface StoreUpdateFailedDetails {
  provider: string;
  externalOrderId: string | null;
  webhookLogId: number | null;
  reason: FailureReason;
}

export interface OrderSystemFailureDetailsByCode {
  CARRIER_STATUS_UNMAPPED: CarrierStatusUnmappedDetails;
  CARRIER_STATUS_IGNORED_STALE: CarrierStatusIgnoredStaleDetails;
  CARRIER_STATUS_IGNORED_PARTIAL_RETURN: CarrierStatusIgnoredPartialReturnDetails;
  CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW: CarrierStatusIgnoredOutsideWindowDetails;
  CARRIER_STATUS_NOT_APPLIED: CarrierStatusNotAppliedDetails;
  CARRIER_CANCELLED_LANE_APPLIED: CarrierCancelledLaneAppliedDetails;
  CARRIER_CANCELLED_LANE_STOCK: CarrierCancelledLaneStockDetails;
  CARRIER_STATUS_CORRECTED: CarrierStatusCorrectedDetails;
  CARRIER_RETURN_AT_MERCHANT: CarrierReturnAtMerchantDetails;
  CARRIER_MESSAGE_AFTER_SWITCH: CarrierMessageAfterSwitchDetails;
  SHIPMENT_NOT_CREATED_MISSING_ADDRESS: ShipmentMissingAddressDetails;
  SHIPMENT_NOT_CREATED_MISSING_PHONE: ShipmentMissingPhoneDetails;
  SHIPMENT_DISPATCH_FAILED: ShipmentDispatchFailedDetails;
  SHIPMENT_UPDATE_NOT_SENT: ShipmentUpdateNotSentDetails;
  SHIPMENT_OUTCOME_UNKNOWN: ShipmentOutcomeUnknownDetails;
  OLD_SHIPMENT_STILL_LIVE: OldShipmentStillLiveDetails;
  AUTOMATION_NOT_SENT: AutomationNotSentDetails;
  AUTOMATION_SEND_FAILED: AutomationSendFailedDetails;
  AUTOMATION_MAPPING_NOT_SAVED: AutomationMappingNotSavedDetails;
  AUTOMATION_RESULT_NOT_APPLIED: AutomationResultNotAppliedDetails;
  AUTOMATION_STATUS_NOT_APPLIED: AutomationStatusNotAppliedDetails;
  STOCK_MOVEMENT_SKIPPED: StockMovementSkippedDetails;
  STOCK_MOVEMENT_BYPASSED: StockMovementBypassedDetails;
  STOCK_MOVEMENT_ALL_BYPASSED: StockMovementAllBypassedDetails;
  STOCK_TRANSITION_BLOCKED: StockTransitionBlockedDetails;
  MACHINE_TRANSITION_STOCK_SHORTAGE: MachineTransitionStockShortageDetails;
  STORE_CREATE_CREATION_STOCK_SHORTAGE: StoreCreateCreationStockShortageDetails;
  SCHEDULED_TRANSITION_FAILED: ScheduledTransitionFailedDetails;
  ORDER_SHADOWED: OrderShadowedDetails;
  SHADOW_ACTIVATION_FAILED: ShadowActivationFailedDetails;
  STORE_UPDATE_NOT_NEW: StoreUpdateNotAppliedDetails;
  STORE_UPDATE_UNMAPPED_VARIANT: StoreUpdateNotAppliedDetails;
  STORE_UPDATE_EMPLOYEE_EDITED: StoreUpdateNotAppliedDetails;
  STORE_UPDATE_NO_CREATION_BASELINE: StoreUpdateNotAppliedDetails;
  STORE_UPDATE_CREATION_STOCK_SHORTAGE: StoreUpdateNotAppliedDetails;
  STORE_UPDATE_FAILED: StoreUpdateFailedDetails;
}

export type FailureDetailsRecord = Record<string, unknown>;

export interface OrderSystemFailure {
  id: number;
  source: OrderSystemFailureSource;
  code: string;
  details: FailureDetailsRecord | null;
  occurrenceCount: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
  actorType: string | null;
  actorEmployeeId: number | null;
  seenAt: string | null;
  seenByEmployeeId: number | null;
  seenByName: string | null;
}

export interface OrderSystemFailuresPage {
  data: OrderSystemFailure[];
  page: number;
  limit: number;
  total: number;
  unseenTotal: number;
  asOf: string;
}

export interface MarkAllSystemFailuresSeenResponse {
  updated: number;
}
