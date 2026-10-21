import { STOCK_SHORTAGE_CODE_LABELS, isOrderSystemFailureCode } from '@/constants/orderSystemFailures';
import type {
  AutomationMappingNotSavedDetails,
  AutomationNotSentDetails,
  AutomationResultNotAppliedDetails,
  AutomationSendFailedDetails,
  AutomationStatusNotAppliedDetails,
  CarrierFailureDetailsBase,
  CarrierStatusIgnoredOutsideWindowDetails,
  CarrierStatusIgnoredPartialReturnDetails,
  CarrierStatusIgnoredStaleDetails,
  CarrierStatusNotAppliedDetails,
  FailureReason,
  FailureStockShortage,
  OrderShadowedDetails,
  OrderSystemFailure,
  OrderSystemFailureCode,
  OrderSystemFailureDetailsByCode,
  ScheduledTransitionFailedDetails,
  ShadowActivationFailedDetails,
  ShipmentDispatchFailedDetails,
  ShipmentDispatchFailureReason,
  ShipmentMissingAddressDetails,
  ShipmentMissingPhoneDetails,
  StockMovementSkippedDetails,
  StoreUpdateFailedDetails,
  StoreUpdateNotAppliedCode,
  StoreUpdateNotAppliedDetails,
  StoreUpdateSnapshot,
} from '@/types/orderSystemFailures';

export type NarrowedFailureDetails = {
  [C in OrderSystemFailureCode]: { code: C; details: OrderSystemFailureDetailsByCode[C] };
}[OrderSystemFailureCode];

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isStringOrNull = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number');

export const isFailureStockShortage = (value: unknown): value is FailureStockShortage =>
  isRecord(value) &&
  isString(value.code) &&
  Object.prototype.hasOwnProperty.call(STOCK_SHORTAGE_CODE_LABELS, value.code) &&
  Array.isArray(value.blocks) &&
  value.blocks.every(
    (block) =>
      isRecord(block) &&
      (block.warehouseId === null || typeof block.warehouseId === 'number') &&
      Array.isArray(block.lines) &&
      block.lines.every(
        (line) =>
          isRecord(line) &&
          typeof line.variantId === 'number' &&
          isString(line.productName) &&
          isString(line.variantLabel) &&
          typeof line.required === 'number' &&
          typeof line.available === 'number'
      )
  );

export const isFailureReason = (value: unknown): value is FailureReason => {
  if (!isRecord(value)) return false;
  switch (value.kind) {
    case 'STOCK_SHORTAGE':
      return isFailureStockShortage(value);
    case 'CARRIER_REJECTED':
      return isString(value.operation) && isString(value.carrierText);
    case 'REJECTED':
      return isString(value.errorCode);
    case 'UNEXPECTED':
      return isString(value.errorName) && isString(value.message);
    default:
      return false;
  }
};

const isShipmentDispatchReason = (value: unknown): value is ShipmentDispatchFailureReason =>
  isFailureReason(value) || (isRecord(value) && value.kind === 'RETIRED_INTEGRATION');

const isCarrierBase = (value: unknown): value is CarrierFailureDetailsBase =>
  isRecord(value) && isString(value.carrier) && isString(value.rawStatus);

const isCarrierStatusIgnoredStale = (
  value: unknown
): value is CarrierStatusIgnoredStaleDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.incomingStatus) &&
  isStringOrNull(value.currentStatus);

const isCarrierStatusIgnoredOutsideWindow = (
  value: unknown
): value is CarrierStatusIgnoredOutsideWindowDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.incomingStatus) &&
  isStringOrNull(value.currentStatus);

const isCarrierStatusIgnoredPartialReturn = (
  value: unknown
): value is CarrierStatusIgnoredPartialReturnDetails =>
  isCarrierBase(value) && isRecord(value) && isString(value.incomingStatus);

const isCarrierStatusNotApplied = (value: unknown): value is CarrierStatusNotAppliedDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.incomingStatus) &&
  isFailureReason(value.reason);

const isShipmentMissingAddress = (value: unknown): value is ShipmentMissingAddressDetails =>
  isRecord(value) &&
  Array.isArray(value.missing) &&
  value.missing.every((field) => field === 'governorate' || field === 'city') &&
  typeof value.switchDeactivated === 'boolean';

const isShipmentMissingPhone = (value: unknown): value is ShipmentMissingPhoneDetails =>
  isRecord(value) && typeof value.switchDeactivated === 'boolean';

const isShipmentDispatchFailed = (value: unknown): value is ShipmentDispatchFailedDetails =>
  isRecord(value) &&
  value.trigger === 'PARKED_RELEASE' &&
  (value.companyName === undefined || isString(value.companyName)) &&
  isShipmentDispatchReason(value.reason);

const isAutomationNotSent = (value: unknown): value is AutomationNotSentDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  (value.reason === 'NO_API_KEY' || value.reason === 'NO_STRATEGY');

const isAutomationSendFailed = (value: unknown): value is AutomationSendFailedDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  (value.httpStatus === null || typeof value.httpStatus === 'number') &&
  isStringOrNull(value.providerMessage);

const isAutomationMappingNotSaved = (
  value: unknown
): value is AutomationMappingNotSavedDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  (value.reason === 'NO_EXTERNAL_ID' || value.reason === 'INSERT_FAILED');

const isAutomationResultNotApplied = (
  value: unknown
): value is AutomationResultNotAppliedDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  isString(value.feedbackLabel) &&
  isString(value.feedbackSummary) &&
  isString(value.orderStatus);

const isAutomationStatusNotApplied = (
  value: unknown
): value is AutomationStatusNotAppliedDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  isString(value.targetStatus) &&
  isFailureReason(value.reason);

const isStockMovementSkipped = (value: unknown): value is StockMovementSkippedDetails =>
  isRecord(value) &&
  isStringOrNull(value.fromStatus) &&
  isString(value.toStatus) &&
  isNumberArray(value.variantIds) &&
  (value.variantIdsTruncatedCount === undefined ||
    typeof value.variantIdsTruncatedCount === 'number');

const isScheduledTransitionFailed = (
  value: unknown
): value is ScheduledTransitionFailedDetails =>
  isRecord(value) &&
  (value.job === 'RESET_ATTEMPTED' || value.job === 'POSTPONED_DUE') &&
  isString(value.targetStatus) &&
  isFailureReason(value.reason);

const isOrderShadowed = (value: unknown): value is OrderShadowedDetails =>
  isRecord(value) &&
  (value.reason === 'NO_PRICING' || value.reason === 'INSUFFICIENT_BALANCE') &&
  (value.price === undefined || typeof value.price === 'number' || isString(value.price));

const isShadowActivationFailed = (value: unknown): value is ShadowActivationFailedDetails =>
  isRecord(value) && isFailureReason(value.reason);

const isStoreUpdateSnapshot = (value: unknown): value is StoreUpdateSnapshot =>
  isRecord(value) &&
  Array.isArray(value.lines) &&
  value.lines.every((line) => isRecord(line) && typeof line.quantity === 'number') &&
  isRecord(value.money) &&
  isRecord(value.customer) &&
  isRecord(value.address);

const isStoreUpdateNotApplied = (value: unknown): value is StoreUpdateNotAppliedDetails =>
  isRecord(value) &&
  isString(value.provider) &&
  isStoreUpdateSnapshot(value.update) &&
  isRecord(value.reason);

const isStoreUpdateFailed = (value: unknown): value is StoreUpdateFailedDetails =>
  isRecord(value) && isString(value.provider) && isFailureReason(value.reason);

export function narrowFailureDetails(
  failure: Pick<OrderSystemFailure, 'code' | 'details'>
): NarrowedFailureDetails | null {
  const { code, details } = failure;
  if (!isOrderSystemFailureCode(code)) return null;
  switch (code) {
    case 'CARRIER_STATUS_UNMAPPED':
      return isCarrierBase(details) ? { code, details } : null;
    case 'CARRIER_STATUS_IGNORED_STALE':
      return isCarrierStatusIgnoredStale(details) ? { code, details } : null;
    case 'CARRIER_STATUS_IGNORED_PARTIAL_RETURN':
      return isCarrierStatusIgnoredPartialReturn(details) ? { code, details } : null;
    case 'CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW':
      return isCarrierStatusIgnoredOutsideWindow(details) ? { code, details } : null;
    case 'CARRIER_STATUS_NOT_APPLIED':
      return isCarrierStatusNotApplied(details) ? { code, details } : null;
    case 'SHIPMENT_NOT_CREATED_MISSING_ADDRESS':
      return isShipmentMissingAddress(details) ? { code, details } : null;
    case 'SHIPMENT_NOT_CREATED_MISSING_PHONE':
      return isShipmentMissingPhone(details) ? { code, details } : null;
    case 'SHIPMENT_DISPATCH_FAILED':
      return isShipmentDispatchFailed(details) ? { code, details } : null;
    case 'AUTOMATION_NOT_SENT':
      return isAutomationNotSent(details) ? { code, details } : null;
    case 'AUTOMATION_SEND_FAILED':
      return isAutomationSendFailed(details) ? { code, details } : null;
    case 'AUTOMATION_MAPPING_NOT_SAVED':
      return isAutomationMappingNotSaved(details) ? { code, details } : null;
    case 'AUTOMATION_RESULT_NOT_APPLIED':
      return isAutomationResultNotApplied(details) ? { code, details } : null;
    case 'AUTOMATION_STATUS_NOT_APPLIED':
      return isAutomationStatusNotApplied(details) ? { code, details } : null;
    case 'STOCK_MOVEMENT_SKIPPED':
      return isStockMovementSkipped(details) ? { code, details } : null;
    case 'SCHEDULED_TRANSITION_FAILED':
      return isScheduledTransitionFailed(details) ? { code, details } : null;
    case 'ORDER_SHADOWED':
      return isOrderShadowed(details) ? { code, details } : null;
    case 'SHADOW_ACTIVATION_FAILED':
      return isShadowActivationFailed(details) ? { code, details } : null;
    case 'STORE_UPDATE_NOT_NEW':
    case 'STORE_UPDATE_UNMAPPED_VARIANT':
    case 'STORE_UPDATE_EMPLOYEE_EDITED':
    case 'STORE_UPDATE_NO_CREATION_BASELINE':
    case 'STORE_UPDATE_CREATION_STOCK_SHORTAGE':
      return isStoreUpdateNotApplied(details) ? { code, details } : null;
    case 'STORE_UPDATE_FAILED':
      return isStoreUpdateFailed(details) ? { code, details } : null;
  }
}

export const isStoreUpdateNotAppliedFailure = (
  narrowed: NarrowedFailureDetails
): narrowed is Extract<NarrowedFailureDetails, { code: StoreUpdateNotAppliedCode }> =>
  narrowed.code === 'STORE_UPDATE_NOT_NEW' ||
  narrowed.code === 'STORE_UPDATE_UNMAPPED_VARIANT' ||
  narrowed.code === 'STORE_UPDATE_EMPLOYEE_EDITED' ||
  narrowed.code === 'STORE_UPDATE_NO_CREATION_BASELINE' ||
  narrowed.code === 'STORE_UPDATE_CREATION_STOCK_SHORTAGE';
