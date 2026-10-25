import type { CarrierSendState } from '@/types/carrierSends';
import type { CarrierSendOperation } from '@/types/orderSystemFailures';

export const CARRIER_SEND_OPEN_STATES: readonly CarrierSendState[] = ['PENDING', 'SEND_ATTEMPTED', 'UNKNOWN'];

export const CARRIER_SEND_STATE_LABELS: Record<CarrierSendState, string> = {
  PENDING: 'بانتظار الإرسال',
  SEND_ATTEMPTED: 'جارٍ الإرسال',
  SENT: 'تم الإرسال',
  REJECTED: 'رفضته شركة الشحن',
  UNKNOWN: 'النتيجة غير معروفة',
  CLOSED_NONE: 'أُغلق بدون شحنة',
};

export const CARRIER_SEND_OPERATION_LABELS: Record<CarrierSendOperation, string> = {
  EDIT: 'تعديل بيانات الطلب',
  SWITCH: 'تغيير شركة الشحن',
  BULK_SWITCH: 'تغيير الشركة بالجملة',
  CREATION: 'إنشاء الشحنة',
  MISSING_ORDER_RECOVERY: 'استرجاع طلب مفقود',
  FOLLOWUP_CHILD: 'طلب متابعة',
  PARKED_RELEASE: 'إطلاق طلب معلّق',
  HELD_ACTIVATION: 'تفعيل طلب محجوز',
  BULK_CONFIRM: 'تأكيد بالجملة',
  SUBMIT_FOR_APPROVAL: 'إرسال للموافقة',
};
