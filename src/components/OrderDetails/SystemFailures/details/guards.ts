import { STOCK_SHORTAGE_CODE_LABELS, isOrderSystemFailureCode } from '@/constants/orderSystemFailures';
import type { ShippingImplementation } from '@/types/shippingCompanies';
import type { AvailableStockRefusalLine } from '@/lib/api/stockShortage';
import type {
  AutomationMappingNotSavedDetails,
  AutomationNotSentDetails,
  AutomationResultNotAppliedDetails,
  AutomationSendFailedDetails,
  AutomationStatusNotAppliedDetails,
  CancelledLaneMovedLine,
  CancelledLaneTrialSkippedLine,
  CancelledLaneUnmovedLine,
  CarrierCancelledLaneAppliedDetails,
  CarrierCancelledLaneStockDetails,
  CarrierFailureDetailsBase,
  CarrierMessageAfterSwitchDetails,
  CarrierStatusCorrectedDetails,
  CarrierStatusIgnoredOutsideWindowDetails,
  CarrierStatusIgnoredPartialReturnDetails,
  CarrierStatusIgnoredStaleDetails,
  CarrierSendOperation,
  CarrierSendRowReason,
  CarrierStatusNotAppliedDetails,
  FailureReason,
  FailureStockShortage,
  FailureStockShortageLine,
  OldShipmentStillLiveDetails,
  OrderShadowedDetails,
  OrderSystemFailure,
  OrderSystemFailureCode,
  OrderSystemFailureDetailsByCode,
  ScheduledTransitionFailedDetails,
  ShadowActivationFailedDetails,
  ShipmentCancelAtCarrierDetails,
  ShipmentDispatchFailedDetails,
  ShipmentCarrierSendDetails,
  ShipmentDispatchFailureReason,
  ShipmentMissingAddressDetails,
  ShipmentMissingPhoneDetails,
  ShipmentOutcomeUnknownDetails,
  ShipmentUpdateNotSentDetails,
  MachineTransitionStockShortageDetails,
  StockMovementAllBypassedDetails,
  StockMovementBypassedDetails,
  StockMovementSkippedDetails,
  StockTransitionBlockedDetails,
  StoreCreateCreationStockShortageDetails,
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

const isAvailableStockRefusalLine = (value: unknown): value is AvailableStockRefusalLine =>
  isRecord(value) &&
  typeof value.variantId === 'number' &&
  isString(value.productName) &&
  isString(value.variantLabel) &&
  typeof value.available === 'number' &&
  typeof value.change === 'number' &&
  typeof value.after === 'number';

const isFailureStockShortageLine = (value: unknown): value is FailureStockShortageLine =>
  isRecord(value) &&
  typeof value.variantId === 'number' &&
  isString(value.productName) &&
  isString(value.variantLabel) &&
  typeof value.required === 'number' &&
  typeof value.available === 'number' &&
  (value.warehouseName === undefined || isString(value.warehouseName));

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
      block.lines.every(isFailureStockShortageLine)
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

const isCancelledLaneMovedLine = (value: unknown): value is CancelledLaneMovedLine =>
  isRecord(value) &&
  isString(value.productName) &&
  isString(value.variantLabel) &&
  typeof value.ruleId === 'number' &&
  isStringOrNull(value.fromWarehouseName) &&
  isStringOrNull(value.toWarehouseName) &&
  typeof value.quantity === 'number';

const isCancelledLaneUnmovedLine = (value: unknown): value is CancelledLaneUnmovedLine =>
  isRecord(value) &&
  isString(value.productName) &&
  isString(value.variantLabel) &&
  isStringOrNull(value.warehouseName);

const isCancelledLaneTrialSkippedLine = (value: unknown): value is CancelledLaneTrialSkippedLine =>
  isRecord(value) && isString(value.productName) && isString(value.variantLabel);

const isCarrierCancelledLaneApplied = (
  value: unknown
): value is CarrierCancelledLaneAppliedDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.incomingStatus) &&
  isStringOrNull(value.cancelReason);

const isCarrierCancelledLaneStock = (value: unknown): value is CarrierCancelledLaneStockDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.incomingStatus) &&
  isString(value.fromStatus) &&
  Array.isArray(value.moved) &&
  value.moved.every(isCancelledLaneMovedLine) &&
  Array.isArray(value.unmoved) &&
  value.unmoved.every(isCancelledLaneUnmovedLine) &&
  (value.trialSkipped === undefined ||
    (Array.isArray(value.trialSkipped) &&
      value.trialSkipped.every(isCancelledLaneTrialSkippedLine)));

const isCarrierStatusCorrected = (value: unknown): value is CarrierStatusCorrectedDetails =>
  isCarrierBase(value) &&
  isRecord(value) &&
  isString(value.fromStatus) &&
  isString(value.toStatus);

const isShipmentMissingAddress = (value: unknown): value is ShipmentMissingAddressDetails =>
  isRecord(value) &&
  Array.isArray(value.missing) &&
  value.missing.every((field) => field === 'governorate' || field === 'city') &&
  typeof value.switchDeactivated === 'boolean';

const isShipmentMissingPhone = (value: unknown): value is ShipmentMissingPhoneDetails =>
  isRecord(value) && typeof value.switchDeactivated === 'boolean';

const isShipmentDispatchFailed = (value: unknown): value is ShipmentDispatchFailedDetails =>
  isRecord(value) &&
  (value.trigger === 'PARKED_RELEASE' || value.trigger === 'HELD_ACTIVATION') &&
  (value.companyName === undefined || isString(value.companyName)) &&
  isShipmentDispatchReason(value.reason);

const SHIPPING_IMPLEMENTATIONS: readonly ShippingImplementation[] = [
  'TURBO',
  'BOSTA',
  'HASHTAG',
  'QUICK_CONNECT',
  'ACCURATE',
  'RM_EXPRESS',
  'JT_EXPRESS',
  'TOROD',
  'CARRIER_NOOP',
];

const CARRIER_SEND_OPERATIONS: readonly CarrierSendOperation[] = [
  'EDIT',
  'SWITCH',
  'BULK_SWITCH',
  'CREATION',
  'MISSING_ORDER_RECOVERY',
  'FOLLOWUP_CHILD',
  'PARKED_RELEASE',
  'HELD_ACTIVATION',
  'BULK_CONFIRM',
  'SUBMIT_FOR_APPROVAL',
];

const CARRIER_SEND_ROW_REASONS: readonly CarrierSendRowReason[] = [
  'TIMEOUT',
  'DEADLINE',
  'NO_RESPONSE',
  'SERVER_ERROR',
  'UNPARSEABLE',
  'SUCCESS_WITHOUT_ID',
  'ID_WRITE_FAILED',
  'STALE_ATTEMPT',
  'UNCLASSIFIED',
  'EXPLICIT',
  'NOT_DISPATCHED',
  'UNSUPPORTED_OPERATION',
  'GUARD_CHANGED',
  'PREVIOUS_SEND_OPEN',
  'HELD_CHECK_REQUIRED',
];

const isShipmentCarrierSend = (value: unknown): value is ShipmentCarrierSendDetails =>
  isRecord(value) &&
  SHIPPING_IMPLEMENTATIONS.some((implementation) => implementation === value.carrier) &&
  typeof value.carrierCompanyId === 'number' &&
  typeof value.markerId === 'number' &&
  CARRIER_SEND_OPERATIONS.some((operation) => operation === value.operation) &&
  CARRIER_SEND_ROW_REASONS.some((reason) => reason === value.reason) &&
  isStringOrNull(value.carrierText) &&
  isStringOrNull(value.oldShippingId);

const isCarrierMessageAfterSwitch = (value: unknown): value is CarrierMessageAfterSwitchDetails =>
  isRecord(value) &&
  isString(value.carrier) &&
  isString(value.carrierName) &&
  typeof value.oldCompanyId === 'number' &&
  isString(value.shippingId);

const isOldShipmentStillLive = (value: unknown): value is OldShipmentStillLiveDetails =>
  isRecord(value) &&
  typeof value.oldCompanyId === 'number' &&
  typeof value.newCompanyId === 'number' &&
  isString(value.shippingId);

const isShipmentCancelAtCarrier = (value: unknown): value is ShipmentCancelAtCarrierDetails =>
  isRecord(value) &&
  typeof value.shippingCompanyId === 'number' &&
  isString(value.carrierName) &&
  isString(value.shippingId);

const isShipmentUpdateNotSent = (value: unknown): value is ShipmentUpdateNotSentDetails =>
  isShipmentCarrierSend(value);

const isShipmentOutcomeUnknown = (value: unknown): value is ShipmentOutcomeUnknownDetails =>
  isShipmentCarrierSend(value);

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

const areBypassedLines = (lines: unknown): boolean =>
  Array.isArray(lines) &&
  lines.every(
    (line) =>
      isRecord(line) &&
      typeof line.variantId === 'number' &&
      isString(line.productName) &&
      isString(line.variantLabel) &&
      isStringOrNull(line.fromWarehouseName) &&
      typeof line.ruleId === 'number' &&
      Array.isArray(line.predecessorKeys) &&
      line.predecessorKeys.every(isString)
  );

const isStockMovementBypassed = (value: unknown): value is StockMovementBypassedDetails =>
  isRecord(value) &&
  isStringOrNull(value.fromStatus) &&
  isString(value.toStatus) &&
  isNumberArray(value.appliedVariantIds) &&
  areBypassedLines(value.lines);

const isStockMovementAllBypassed = (value: unknown): value is StockMovementAllBypassedDetails =>
  isRecord(value) &&
  isStringOrNull(value.fromStatus) &&
  isString(value.toStatus) &&
  areBypassedLines(value.lines);

const isStockTransitionBlocked = (value: unknown): value is StockTransitionBlockedDetails =>
  isRecord(value) &&
  isString(value.fromStatus) &&
  isString(value.toStatus) &&
  (value.ruleId === null || typeof value.ruleId === 'number') &&
  isStringOrNull(value.warehouseName) &&
  (value.lines === undefined ||
    (Array.isArray(value.lines) &&
      value.lines.every(
        (line) => isFailureStockShortageLine(line) || isAvailableStockRefusalLine(line)
      ))) &&
  (value.errorCode === undefined || isStringOrNull(value.errorCode));

const isMachineTransitionStockShortage = (
  value: unknown
): value is MachineTransitionStockShortageDetails =>
  isRecord(value) &&
  (value.job === 'SCHEDULED' ||
    value.job === 'VROBO' ||
    value.job === 'PARKED_RELEASE' ||
    value.job === 'SHADOW_RELEASE') &&
  isStringOrNull(value.fromStatus) &&
  isString(value.intendedStatus) &&
  (value.errorCode === undefined || isStringOrNull(value.errorCode));

const isStoreCreateCreationStockShortage = (
  value: unknown
): value is StoreCreateCreationStockShortageDetails =>
  isRecord(value) &&
  isString(value.targetStatus) &&
  Array.isArray(value.lines) &&
  value.lines.every(isFailureStockShortageLine);

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
    case 'CARRIER_CANCELLED_LANE_APPLIED':
      return isCarrierCancelledLaneApplied(details) ? { code, details } : null;
    case 'CARRIER_CANCELLED_LANE_STOCK':
      return isCarrierCancelledLaneStock(details) ? { code, details } : null;
    case 'CARRIER_STATUS_CORRECTED':
      return isCarrierStatusCorrected(details) ? { code, details } : null;
    case 'CARRIER_RETURN_AT_MERCHANT':
      return isCarrierBase(details) ? { code, details } : null;
    case 'CARRIER_MESSAGE_AFTER_SWITCH':
      return isCarrierMessageAfterSwitch(details) ? { code, details } : null;
    case 'SHIPMENT_NOT_CREATED_MISSING_ADDRESS':
      return isShipmentMissingAddress(details) ? { code, details } : null;
    case 'SHIPMENT_NOT_CREATED_MISSING_PHONE':
      return isShipmentMissingPhone(details) ? { code, details } : null;
    case 'SHIPMENT_DISPATCH_FAILED':
      return isShipmentDispatchFailed(details) ? { code, details } : null;
    case 'SHIPMENT_UPDATE_NOT_SENT':
      return isShipmentUpdateNotSent(details) ? { code, details } : null;
    case 'SHIPMENT_OUTCOME_UNKNOWN':
      return isShipmentOutcomeUnknown(details) ? { code, details } : null;
    case 'OLD_SHIPMENT_STILL_LIVE':
      return isOldShipmentStillLive(details) ? { code, details } : null;
    case 'SHIPMENT_CANCEL_AT_CARRIER':
      return isShipmentCancelAtCarrier(details) ? { code, details } : null;
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
    case 'STOCK_MOVEMENT_BYPASSED':
      return isStockMovementBypassed(details) ? { code, details } : null;
    case 'STOCK_MOVEMENT_ALL_BYPASSED':
      return isStockMovementAllBypassed(details) ? { code, details } : null;
    case 'STOCK_TRANSITION_BLOCKED':
      return isStockTransitionBlocked(details) ? { code, details } : null;
    case 'MACHINE_TRANSITION_STOCK_SHORTAGE':
      return isMachineTransitionStockShortage(details) ? { code, details } : null;
    case 'STORE_CREATE_CREATION_STOCK_SHORTAGE':
      return isStoreCreateCreationStockShortage(details) ? { code, details } : null;
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
