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

export const ORDER_SYSTEM_FAILURE_LABELS: Record<OrderSystemFailureCode, string> = {
  CARRIER_STATUS_UNMAPPED: 'وصلت حالة من شركة الشحن غير معروفة للنظام',
  CARRIER_STATUS_IGNORED_STALE: 'تم تجاهل حالة من شركة الشحن لأنها أقدم من حالة الطلب',
  CARRIER_STATUS_IGNORED_PARTIAL_RETURN: 'تم تجاهل حالة المرتجع من شركة الشحن لأن للطلب مرتجعاً جزئياً',
  CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW: 'تم تجاهل حالة شركة الشحن لأن الطلب خارج مرحلة الشحن',
  CARRIER_STATUS_NOT_APPLIED: 'لم يتم تطبيق حالة شركة الشحن',
  CARRIER_CANCELLED_LANE_APPLIED: 'تم تطبيق حالة من شركة الشحن على طلب ملغي، راجعه',
  CARRIER_CANCELLED_LANE_STOCK: 'تم تطبيق حالة شركة الشحن على طلب ملغي: تحقق من المخزون',
  CARRIER_STATUS_CORRECTED: 'غيّرت شركة الشحن حالة طلب كنا قد حددناها. راجع الطلب',
  CARRIER_RETURN_AT_MERCHANT: 'شركة الشحن تفيد بأن الشحنة عادت إلى التاجر، ولم تتغير حالة الطلب',
  CARRIER_MESSAGE_AFTER_SWITCH: 'وصلت رسالة من شركة الشحن القديمة بعد تغيير الشركة: ألغِ الشحنة لديها يدوياً',
  SHIPMENT_NOT_CREATED_MISSING_ADDRESS: 'لم يتم إرسال الطلب للشحن: المحافظة أو المدينة غير موجودة',
  SHIPMENT_NOT_CREATED_MISSING_PHONE: 'لم يتم إرسال الطلب للشحن: رقم الهاتف غير موجود',
  SHIPMENT_DISPATCH_FAILED: 'فشل إرسال الطلب لشركة الشحن',
  SHIPMENT_UPDATE_NOT_SENT: 'لم يتم إرسال التعديل لشركة الشحن: تحقق من الشركة قبل إعادة الإرسال',
  SHIPMENT_OUTCOME_UNKNOWN: 'لم يتم الإرسال: النتيجة غير معروفة، تحقق من شركة الشحن قبل إعادة الإرسال',
  OLD_SHIPMENT_STILL_LIVE: 'الشحنة القديمة ما زالت فعالة لدى شركة الشحن السابقة: ألغِها هناك',
  SHIPMENT_CANCEL_AT_CARRIER: 'الشحنة ما زالت لدى شركة الشحن، ألغِها يدويًا لدى الشركة',
  AUTOMATION_NOT_SENT: 'لم يتم إرسال الطلب للأتمتة',
  AUTOMATION_SEND_FAILED: 'فشل إرسال الطلب للأتمتة',
  AUTOMATION_MAPPING_NOT_SAVED: 'لم يتم حفظ ربط الطلب مع الأتمتة',
  AUTOMATION_RESULT_NOT_APPLIED: 'وصلت نتيجة من الأتمتة ولم يتم تطبيقها',
  AUTOMATION_STATUS_NOT_APPLIED: 'لم يتم تطبيق الحالة القادمة من الأتمتة',
  STOCK_MOVEMENT_SKIPPED: 'تم تخطي حركة المخزون لعدم كفاية الكمية',
  STOCK_MOVEMENT_BYPASSED: 'تم تخطي جزء من حركة المخزون لأن مرحلة سابقة لم تحركه',
  STOCK_MOVEMENT_ALL_BYPASSED: 'طلب خارج تتبع المخزون',
  STOCK_TRANSITION_BLOCKED: 'تم منع تغيير حالة الطلب لعدم كفاية المخزون',
  MACHINE_TRANSITION_STOCK_SHORTAGE: 'لم يُطبَّق الانتقال بسبب نقص المخزون',
  STORE_CREATE_CREATION_STOCK_SHORTAGE: 'وصل طلب من المتجر ولم يُحجز مخزونه لعدم كفاية المخزون',
  SCHEDULED_TRANSITION_FAILED: 'فشل تغيير حالة الطلب التلقائي',
  ORDER_SHADOWED: 'تم تعليق الطلب (فوترة)',
  SHADOW_ACTIVATION_FAILED: 'فشل تفعيل الطلب المعلق (فوترة)',
  STORE_UPDATE_NOT_NEW: 'وصل تحديث من المتجر ولم يتم تطبيقه لأن الطلب لم يعد جديداً',
  STORE_UPDATE_UNMAPPED_VARIANT: 'وصل تحديث من المتجر ولم يتم تطبيقه لوجود منتج غير مربوط',
  STORE_UPDATE_EMPLOYEE_EDITED: 'وصل تحديث من المتجر ولم يتم تطبيقه لأن الطلب تم تعديله',
  STORE_UPDATE_NO_CREATION_BASELINE: 'وصل تحديث من المتجر ولم يتم تطبيقه لعدم وجود بيانات الإنشاء للمقارنة',
  STORE_UPDATE_CREATION_STOCK_SHORTAGE: 'وصل تحديث من المتجر ولم يتم تطبيقه لعدم كفاية المخزون',
  STORE_UPDATE_FAILED: 'فشل تطبيق تحديث من المتجر',
};

export const ORDER_SYSTEM_FAILURE_FALLBACK_LABEL = 'عطل في النظام';

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
  Object.prototype.hasOwnProperty.call(ORDER_SYSTEM_FAILURE_LABELS, code);

export const orderSystemFailureLabelOf = (code: string) =>
  isOrderSystemFailureCode(code) ? ORDER_SYSTEM_FAILURE_LABELS[code] : ORDER_SYSTEM_FAILURE_FALLBACK_LABEL;

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
