import type { OrderPaymentStatus } from '@/types/missing-orders';
import type { OrderChangeOrigin } from '@/types/orderChangeHistory';
import { ShippingType } from '@/types/orders';

export const ORDER_FIELD_LABELS: Record<string, string> = {
  status: 'حالة الطلب',
  code: 'كود الطلب',
  customerId: 'العميل',
  address: 'العنوان بالتفصيل',
  governorate: 'المحافظة',
  city: 'المنطقة',
  area: 'الحي',
  externalGovernorate: 'المحافظة في المتجر',
  externalCity: 'المدينة في المتجر',
  totalCost: 'السعر',
  shippingCost: 'سعر الشحن',
  couponDiscount: 'خصم الكوبون',
  returnShippingCost: 'مصاريف شحن المرتجع',
  prepaidAmount: 'المبلغ المدفوع مسبقاً',
  coupon: 'الكوبون',
  paymentMethod: 'طريقة الدفع',
  paymentStatus: 'حالة الدفع',
  settlementAmount: 'مبلغ التسوية',
  settlementSource: 'مصدر التسوية',
  settlementResolved: 'تمت التسوية',
  notes: 'ملاحظات',
  shippingNotes: 'ملاحظات الشحن',
  packagingNotes: 'ملاحظات التغليف',
  callCenterNotes: 'ملاحظات خدمة العملاء',
  cancelReason: 'سبب الإلغاء',
  cancelNotes: 'ملاحظات الإلغاء',
  shippingCompanyId: 'شركة الشحن',
  shippingType: 'نوع الشحن',
  canOpenShipment: 'السماح بفتح الشحنة',
  shipmentContent: 'محتوى الشحنة',
  returnShipmentContent: 'محتوى شحنة الاسترجاع',
  material: 'الخامة',
  weight: 'الوزن',
  countryOfManufacture: 'بلد التصنيع',
  countryOfOrder: 'بلد الطلب',
  shipmentPickupCode: 'كود استلام الشحنة',
  pickupInvoice: 'فاتورة الاستلام',
  urgentDate: 'تاريخ الاستعجال',
  availableFrom: 'متاح من',
  availableTo: 'متاح إلى',
  postponedUntil: 'مؤجل حتى',
  webhookShippingStatus: 'حالة الشحنة لدى شركة الشحن',
  delegateName: 'اسم المندوب',
  delegatePhone: 'هاتف المندوب',
  isPrinted: 'تمت الطباعة',
  isShadowed: 'معلق (فوترة)',
  parkedAt: 'تاريخ الإيقاف',
  lines: 'المنتجات',
  'line.variant': 'خيار المنتج',
  'line.price': 'سعر المنتج',
  'line.sku': 'SKU المنتج',
  'line.customVariants': 'الخيارات المخصصة للمنتج',
  'customer.name': 'اسم العميل',
  'customer.email': 'البريد الإلكتروني للعميل',
  'customer.phoneNumbers': 'أرقام هاتف العميل',
  'customer.notes': 'ملاحظات العميل',
  'customer.isBlocked': 'العميل محظور',
  'customer.blockedUntil': 'العميل محظور حتى',
};

export const orderFieldLabelOf = (field: string) =>
  Object.prototype.hasOwnProperty.call(ORDER_FIELD_LABELS, field) ? ORDER_FIELD_LABELS[field] : field;

export const ORDER_CHANGE_ORIGIN_LABELS: Record<OrderChangeOrigin, string> = {
  ORDER_EDIT: 'تعديل الطلب',
  LINE_EDIT: 'تعديل المنتجات',
  BULK_UPDATE: 'تعديل جماعي',
  CANCEL: 'إلغاء',
  PRINT: 'طباعة',
  PREPARE: 'تجهيز',
  CALL_AGAIN: 'إعادة الاتصال',
  WAITING_FOR_PACKAGING: 'انتظار التغليف',
  SUBMIT_FOR_APPROVAL: 'إرسال للموافقة',
  RETURN_RECEIPT: 'استلام مرتجع',
  SETTLEMENT_UPLOAD: 'رفع ملف التسوية',
  SETTLEMENT_REMOVE: 'حذف التسوية',
  SETTLEMENT_AMOUNT_EDIT: 'تعديل مبلغ التسوية',
  SETTLEMENT_ADJUST: 'تسوية يدوية',
  PARTIAL_DELIVERY: 'تسليم جزئي',
  FOLLOWUP_CHANGE_PRODUCTS: 'متابعة: تغيير المنتجات',
  FOLLOWUP_CANCEL: 'متابعة: إلغاء',
  PARKED_RELEASE: 'إطلاق طلب موقوف',
  BILLING_ACTIVATION: 'تفعيل بالفوترة',
  CUSTOMER_EDIT: 'تعديل العميل',
  CUSTOMER_MERGE: 'دمج العملاء',
  CARRIER_WEBHOOK: 'شركة الشحن',
  AUTOMATION_CALLBACK: 'الأتمتة',
  SCHEDULED_POSTPONED_DUE: 'مهمة مجدولة: انتهاء التأجيل',
  SCHEDULED_RESET_ATTEMPTED: 'مهمة مجدولة: إعادة محاولات الاتصال',
  STORE_UPDATE: 'تحديث المتجر',
  UNSPECIFIED: 'غير محدد',
};

export const orderChangeOriginLabelOf = (origin: string) =>
  Object.prototype.hasOwnProperty.call(ORDER_CHANGE_ORIGIN_LABELS, origin)
    ? ORDER_CHANGE_ORIGIN_LABELS[origin as OrderChangeOrigin]
    : origin;

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  PAID: 'مدفوع',
  CASH_ON_DELIVERY: 'الدفع عند الاستلام',
  PARTIALLY_PAID: 'مدفوع جزئياً',
};

export const ORDER_PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: 'كاش',
  VISA_CARD: 'بطاقة ائتمان',
  INSTAPAY: 'انستا باي',
  WALLET: 'محفظة الكترونيه',
};

export const ORDER_SHIPPING_TYPE_LABELS: Record<ShippingType, string> = {
  [ShippingType.DELIVERY]: 'توصيل',
  [ShippingType.EXCHANGE]: 'استبدال',
  [ShippingType.RETURN]: 'مرتجع',
  [ShippingType.PARTIAL_RETURN]: 'تسليم جزئي',
};

export const SETTLEMENT_RECORD_TYPE_LABELS: Record<string, string> = {
  EXCEL: 'ملف إكسل',
  ADJUST: 'تسوية يدوية',
  EDIT: 'تعديل المبلغ',
};

export const enumLabelOf = (labels: Record<string, string>, value: string) =>
  Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value;
