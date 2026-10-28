import type { TranslationKey } from '@/i18n/translate';
import type {
  AutomationMappingNotSavedReason,
  AutomationNotSentReason,
  CarrierSendRowReason,
  CarrierUnknownReason,
  FailureActorType,
  FailureReasonKind,
  OrderShadowedReason,
  OrderSystemFailure,
  OrderSystemFailureCode,
  OrderSystemFailureSource,
  ScheduledTransitionJob,
  ShipmentMissingAddressField,
  StockShortageCode,
} from '@/types/orderSystemFailures';

export const ORDER_SYSTEM_FAILURE_LABEL_KEYS: Record<OrderSystemFailureCode, TranslationKey> = {
  CARRIER_STATUS_UNMAPPED: 'orderSystemFailures.label.CARRIER_STATUS_UNMAPPED',
  CARRIER_STATUS_IGNORED_STALE: 'orderSystemFailures.label.CARRIER_STATUS_IGNORED_STALE',
  CARRIER_STATUS_IGNORED_PARTIAL_RETURN: 'orderSystemFailures.label.CARRIER_STATUS_IGNORED_PARTIAL_RETURN',
  CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW: 'orderSystemFailures.label.CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW',
  CARRIER_STATUS_NOT_APPLIED: 'orderSystemFailures.label.CARRIER_STATUS_NOT_APPLIED',
  CARRIER_CANCELLED_LANE_APPLIED: 'orderSystemFailures.label.CARRIER_CANCELLED_LANE_APPLIED',
  CARRIER_CANCELLED_LANE_STOCK: 'orderSystemFailures.label.CARRIER_CANCELLED_LANE_STOCK',
  CARRIER_STATUS_CORRECTED: 'orderSystemFailures.label.CARRIER_STATUS_CORRECTED',
  CARRIER_RETURN_AT_MERCHANT: 'orderSystemFailures.label.CARRIER_RETURN_AT_MERCHANT',
  CARRIER_MESSAGE_AFTER_SWITCH: 'orderSystemFailures.label.CARRIER_MESSAGE_AFTER_SWITCH',
  SHIPMENT_NOT_CREATED_MISSING_ADDRESS: 'orderSystemFailures.label.SHIPMENT_NOT_CREATED_MISSING_ADDRESS',
  SHIPMENT_NOT_CREATED_MISSING_PHONE: 'orderSystemFailures.label.SHIPMENT_NOT_CREATED_MISSING_PHONE',
  SHIPMENT_DISPATCH_FAILED: 'orderSystemFailures.label.SHIPMENT_DISPATCH_FAILED',
  SHIPMENT_UPDATE_NOT_SENT: 'orderSystemFailures.label.SHIPMENT_UPDATE_NOT_SENT',
  SHIPMENT_OUTCOME_UNKNOWN: 'orderSystemFailures.label.SHIPMENT_OUTCOME_UNKNOWN',
  OLD_SHIPMENT_STILL_LIVE: 'orderSystemFailures.label.OLD_SHIPMENT_STILL_LIVE',
  SHIPMENT_CANCEL_AT_CARRIER: 'orderSystemFailures.label.SHIPMENT_CANCEL_AT_CARRIER',
  AUTOMATION_NOT_SENT: 'orderSystemFailures.label.AUTOMATION_NOT_SENT',
  AUTOMATION_SEND_FAILED: 'orderSystemFailures.label.AUTOMATION_SEND_FAILED',
  AUTOMATION_MAPPING_NOT_SAVED: 'orderSystemFailures.label.AUTOMATION_MAPPING_NOT_SAVED',
  AUTOMATION_RESULT_NOT_APPLIED: 'orderSystemFailures.label.AUTOMATION_RESULT_NOT_APPLIED',
  AUTOMATION_STATUS_NOT_APPLIED: 'orderSystemFailures.label.AUTOMATION_STATUS_NOT_APPLIED',
  STOCK_MOVEMENT_SKIPPED: 'orderSystemFailures.label.STOCK_MOVEMENT_SKIPPED',
  STOCK_MOVEMENT_BYPASSED: 'orderSystemFailures.label.STOCK_MOVEMENT_BYPASSED',
  STOCK_MOVEMENT_ALL_BYPASSED: 'orderSystemFailures.label.STOCK_MOVEMENT_ALL_BYPASSED',
  STOCK_TRANSITION_BLOCKED: 'orderSystemFailures.label.STOCK_TRANSITION_BLOCKED',
  MACHINE_TRANSITION_STOCK_SHORTAGE: 'orderSystemFailures.label.MACHINE_TRANSITION_STOCK_SHORTAGE',
  STORE_CREATE_CREATION_STOCK_SHORTAGE: 'orderSystemFailures.label.STORE_CREATE_CREATION_STOCK_SHORTAGE',
  SCHEDULED_TRANSITION_FAILED: 'orderSystemFailures.label.SCHEDULED_TRANSITION_FAILED',
  ORDER_SHADOWED: 'orderSystemFailures.label.ORDER_SHADOWED',
  SHADOW_ACTIVATION_FAILED: 'orderSystemFailures.label.SHADOW_ACTIVATION_FAILED',
  STORE_UPDATE_NOT_NEW: 'orderSystemFailures.label.STORE_UPDATE_NOT_NEW',
  STORE_UPDATE_UNMAPPED_VARIANT: 'orderSystemFailures.label.STORE_UPDATE_UNMAPPED_VARIANT',
  STORE_UPDATE_EMPLOYEE_EDITED: 'orderSystemFailures.label.STORE_UPDATE_EMPLOYEE_EDITED',
  STORE_UPDATE_NO_CREATION_BASELINE: 'orderSystemFailures.label.STORE_UPDATE_NO_CREATION_BASELINE',
  STORE_UPDATE_CREATION_STOCK_SHORTAGE: 'orderSystemFailures.label.STORE_UPDATE_CREATION_STOCK_SHORTAGE',
  STORE_UPDATE_FAILED: 'orderSystemFailures.label.STORE_UPDATE_FAILED',
};

export const ORDER_SYSTEM_FAILURE_FALLBACK_LABEL_KEY: TranslationKey = 'orderSystemFailures.label.fallback';

export const SHIPMENT_UPDATE_NOT_SENT_REASON_SENTENCES: Record<
  Exclude<CarrierSendRowReason, CarrierUnknownReason>,
  string
> = {
  EXPLICIT: 'لم يتم إرسال التعديل لشركة الشحن {carrier}: تحقق منها، ثم أعد الإرسال',
  NOT_DISPATCHED: 'لم يتم إرسال التعديل لشركة الشحن {carrier}: تحقق منها، ثم أعد الإرسال',
  UNSUPPORTED_OPERATION: 'لم يتم إرسال التعديل لشركة الشحن {carrier}: تحقق منها، ثم أعد الإرسال',
  HELD_CHECK_REQUIRED: 'لم يتم إرسال التعديل لشركة الشحن {carrier}: تحقق من شركة الشحن، ثم أكد الإرسال',
  PREVIOUS_SEND_OPEN:
    'لم يتم إرسال التعديل لشركة الشحن {carrier}: يوجد إرسال سابق لهذا الطلب ما زال مفتوحاً، تحقق منه أولاً',
  GUARD_CHANGED: 'لم يتم إرسال التعديل لشركة الشحن {carrier}: تغيّر الطلب قبل الإرسال، احفظ التعديل مرة أخرى',
};

export const SHIPMENT_OUTCOME_UNKNOWN_SENTENCE = 'النتيجة غير معروفة: تحقق من شركة الشحن {carrier} قبل إعادة الإرسال';

export const isShipmentUpdateNotSentReason = (
  reason: CarrierSendRowReason
): reason is keyof typeof SHIPMENT_UPDATE_NOT_SENT_REASON_SENTENCES =>
  Object.prototype.hasOwnProperty.call(SHIPMENT_UPDATE_NOT_SENT_REASON_SENTENCES, reason);

export const shipmentCarrierSendSentenceOf = (
  code: 'SHIPMENT_UPDATE_NOT_SENT' | 'SHIPMENT_OUTCOME_UNKNOWN',
  reason: CarrierSendRowReason,
  carrier: string
): string | null => {
  if (code === 'SHIPMENT_OUTCOME_UNKNOWN') return SHIPMENT_OUTCOME_UNKNOWN_SENTENCE.replace('{carrier}', carrier);
  if (!isShipmentUpdateNotSentReason(reason)) return null;
  return SHIPMENT_UPDATE_NOT_SENT_REASON_SENTENCES[reason].replace('{carrier}', carrier);
};

export const ORDER_SYSTEM_FAILURE_SOURCE_LABELS: Record<OrderSystemFailureSource, string> = {
  CARRIER_WEBHOOK: 'شركة الشحن',
  SHIPPING_DISPATCH: 'الإرسال للشحن',
  AUTOMATION: 'الأتمتة',
  STOCK_WORKFLOW: 'المخزون',
  SCHEDULED_JOB: 'مهمة مجدولة',
  BILLING: 'الفوترة',
  INTEGRATION_ORDER_UPDATE: 'تحديث المتجر',
};

export const FAILURE_REASON_KIND_LABELS: Record<FailureReasonKind | 'RETIRED_INTEGRATION', string> = {
  STOCK_SHORTAGE: 'نقص في المخزون',
  CARRIER_REJECTED: 'رفض من شركة الشحن',
  REJECTED: 'رفض من النظام',
  UNEXPECTED: 'خطأ غير متوقع',
  RETIRED_INTEGRATION: 'شركة الشحن لم تعد متاحة',
};

export const STOCK_SHORTAGE_CODE_LABELS: Record<StockShortageCode, string> = {
  INSUFFICIENT_STOCK_FOR_VARIANT: 'الكمية المتاحة غير كافية',
  ADJUSTMENT_BELOW_ZERO: 'التعديل ينزل بالكمية تحت الصفر',
  TRANSFER_INSUFFICIENT_STOCK: 'الكمية غير كافية للتحويل',
  OUTBOUND_INSUFFICIENT_STOCK: 'الكمية غير كافية للصرف',
};

export const ACTOR_TYPE_LABELS: Record<FailureActorType, string> = {
  EMPLOYEE: 'موظف',
  SYSTEM: 'النظام',
  WEBHOOK: 'إشعار خارجي',
  CRON: 'مهمة مجدولة',
  PLATFORM: 'إدارة المنصة',
};

export const AUTOMATION_NOT_SENT_REASON_LABELS: Record<AutomationNotSentReason, string> = {
  NO_API_KEY: 'مفتاح الربط غير موجود',
  NO_STRATEGY: 'مزود الأتمتة غير مدعوم',
};

export const AUTOMATION_MAPPING_NOT_SAVED_REASON_LABELS: Record<AutomationMappingNotSavedReason, string> = {
  NO_EXTERNAL_ID: 'لم يرجع مزود الأتمتة رقماً للطلب',
  INSERT_FAILED: 'تعذر حفظ الربط',
};

export const SCHEDULED_TRANSITION_JOB_LABELS: Record<ScheduledTransitionJob, string> = {
  RESET_ATTEMPTED: 'إعادة الطلبات التي تمت محاولة الاتصال بها',
  POSTPONED_DUE: 'إعادة الطلبات المؤجلة عند موعدها',
};

export const ORDER_SHADOWED_REASON_LABELS: Record<OrderShadowedReason, string> = {
  NO_PRICING: 'لا يوجد سعر للطلب في الباقة',
  INSUFFICIENT_BALANCE: 'رصيد المحفظة غير كافٍ',
};

export const SHIPMENT_MISSING_ADDRESS_FIELD_LABELS: Record<ShipmentMissingAddressField, string> = {
  governorate: 'المحافظة',
  city: 'المدينة',
};

export const INFO_CODES: readonly OrderSystemFailureCode[] = [
  'CARRIER_STATUS_IGNORED_STALE',
  'CARRIER_STATUS_IGNORED_PARTIAL_RETURN',
  'CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW',
  'CARRIER_RETURN_AT_MERCHANT',
  'CARRIER_STATUS_CORRECTED',
  'STORE_UPDATE_NOT_NEW',
  'STORE_UPDATE_EMPLOYEE_EDITED',
  'ORDER_SHADOWED',
];

export const isOrderSystemFailureCode = (code: string): code is OrderSystemFailureCode =>
  Object.prototype.hasOwnProperty.call(ORDER_SYSTEM_FAILURE_LABEL_KEYS, code);

export const orderSystemFailureLabelKeyOf = (code: string): TranslationKey =>
  isOrderSystemFailureCode(code) ? ORDER_SYSTEM_FAILURE_LABEL_KEYS[code] : ORDER_SYSTEM_FAILURE_FALLBACK_LABEL_KEY;

export const isInfoCode = (code: string) =>
  isOrderSystemFailureCode(code) && INFO_CODES.includes(code);

const RETRYABLE_HELD_SOURCE_CODES: readonly {
  source: OrderSystemFailureSource;
  code: OrderSystemFailureCode;
}[] = [
  { source: 'CARRIER_WEBHOOK', code: 'CARRIER_STATUS_NOT_APPLIED' },
  { source: 'STOCK_WORKFLOW', code: 'MACHINE_TRANSITION_STOCK_SHORTAGE' },
];

export const isRetryableHeld = (failure: OrderSystemFailure) =>
  failure.kind === 'HELD' &&
  RETRYABLE_HELD_SOURCE_CODES.some(({ source, code }) => source === failure.source && code === failure.code);

const isFailureActorType = (value: string): value is FailureActorType =>
  Object.prototype.hasOwnProperty.call(ACTOR_TYPE_LABELS, value);

export const actorTypeLabelOf = (actorType: string | null) => {
  if (!actorType) return null;
  return isFailureActorType(actorType) ? ACTOR_TYPE_LABELS[actorType] : actorType;
};
