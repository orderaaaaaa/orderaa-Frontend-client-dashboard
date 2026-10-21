import type {
  AutomationMappingNotSavedReason,
  AutomationNotSentReason,
  FailureActorType,
  FailureReasonKind,
  OrderShadowedReason,
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
  SHIPMENT_NOT_CREATED_MISSING_ADDRESS: 'لم يتم إرسال الطلب للشحن: المحافظة أو المدينة غير موجودة',
  SHIPMENT_NOT_CREATED_MISSING_PHONE: 'لم يتم إرسال الطلب للشحن: رقم الهاتف غير موجود',
  SHIPMENT_DISPATCH_FAILED: 'فشل إرسال الطلب لشركة الشحن',
  AUTOMATION_NOT_SENT: 'لم يتم إرسال الطلب للأتمتة',
  AUTOMATION_SEND_FAILED: 'فشل إرسال الطلب للأتمتة',
  AUTOMATION_MAPPING_NOT_SAVED: 'لم يتم حفظ ربط الطلب مع الأتمتة',
  AUTOMATION_RESULT_NOT_APPLIED: 'وصلت نتيجة من الأتمتة ولم يتم تطبيقها',
  AUTOMATION_STATUS_NOT_APPLIED: 'لم يتم تطبيق الحالة القادمة من الأتمتة',
  STOCK_MOVEMENT_SKIPPED: 'تم تخطي حركة المخزون لعدم كفاية الكمية',
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

export const NOTICE_CODES: readonly OrderSystemFailureCode[] = [
  'CARRIER_STATUS_IGNORED_STALE',
  'CARRIER_STATUS_IGNORED_PARTIAL_RETURN',
  'CARRIER_STATUS_IGNORED_OUTSIDE_WINDOW',
];

export const isOrderSystemFailureCode = (code: string): code is OrderSystemFailureCode =>
  Object.prototype.hasOwnProperty.call(ORDER_SYSTEM_FAILURE_LABELS, code);

export const orderSystemFailureLabelOf = (code: string) =>
  isOrderSystemFailureCode(code) ? ORDER_SYSTEM_FAILURE_LABELS[code] : ORDER_SYSTEM_FAILURE_FALLBACK_LABEL;

export const isNoticeCode = (code: string) =>
  isOrderSystemFailureCode(code) && NOTICE_CODES.includes(code);

const isFailureActorType = (value: string): value is FailureActorType =>
  Object.prototype.hasOwnProperty.call(ACTOR_TYPE_LABELS, value);

export const actorTypeLabelOf = (actorType: string | null) => {
  if (!actorType) return null;
  return isFailureActorType(actorType) ? ACTOR_TYPE_LABELS[actorType] : actorType;
};
