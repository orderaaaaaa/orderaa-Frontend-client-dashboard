import type {
  MissingOrderFailureCode,
  MissingOrderSourceFormat,
  MissingOrderStatus,
  MissingOrderStatusFilter,
  OrderPaymentStatus,
} from '@/types/missing-orders';

export const MISSING_ORDER_STATUS_LABELS: Record<MissingOrderStatus, string> = {
  OPEN: 'مفتوح',
  RECOVERED: 'تمت الاستعادة',
  DISMISSED: 'مستبعد',
};

export const MISSING_ORDER_STATUS_FILTER_TABS: {
  value: MissingOrderStatusFilter;
  label: string;
}[] = [
  { value: 'OPEN', label: 'مفتوح' },
  { value: 'RECOVERED', label: 'تمت الاستعادة' },
  { value: 'DISMISSED', label: 'مستبعد' },
  { value: 'ALL', label: 'الكل' },
];

export const MISSING_ORDER_FAILURE_LABELS: Record<
  MissingOrderFailureCode,
  string
> = {
  INVALID_PAYLOAD: 'بيانات الطلب الواردة غير مكتملة',
  MISSING_EXTERNAL_ID: 'رقم الطلب في المتجر غير موجود',
  UNKNOWN_PROVIDER: 'مصدر الطلب غير معروف',
  STORE_NOT_FOUND: 'المتجر غير موجود',
  PRODUCT_UNRESOLVED: 'المنتج غير معروف',
  VARIANT_REQUIRED: 'يجب اختيار نوع المنتج',
  VARIANT_OPTIONS_INVALID: 'خيارات المنتج غير صحيحة',
  VARIANT_DUPLICATE_ATTRIBUTE: 'تم اختيار أكثر من قيمة لنفس الخاصية',
  VARIANT_INCOMPLETE: 'خيارات المنتج غير مكتملة',
  TIMEOUT: 'انتهت مهلة معالجة الطلب',
  TRANSIENT_EXHAUSTED: 'تعذر الاتصال بقاعدة البيانات بعد عدة محاولات',
  STALE_RUNNING: 'توقفت معالجة الطلب بشكل غير متوقع',
  STALE_PENDING: 'لم تكتمل معالجة الطلب',
  INTERNAL: 'خطأ داخلي في النظام',
} as const;

export const INTERNAL_CLASS_FAILURE_CODES: readonly MissingOrderFailureCode[] =
  ['INTERNAL', 'TIMEOUT', 'TRANSIENT_EXHAUSTED', 'STALE_RUNNING', 'STALE_PENDING'];

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  PAID: 'مدفوع',
  CASH_ON_DELIVERY: 'الدفع عند الاستلام',
  PARTIALLY_PAID: 'مدفوع جزئياً',
};

export const MISSING_ORDER_SOURCE_OPTIONS: { value: MissingOrderSourceFormat; label: string }[] = [
  { value: 'EASYORDER', label: 'EasyOrders' },
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'LIGHTFUNNELS', label: 'Lightfunnels' },
];
