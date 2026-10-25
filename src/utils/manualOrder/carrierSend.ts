import type { CarrierSendBlock } from '@/types/manual-order';

export const CARRIER_SEND_NOT_SENT_WARNING =
  'تم حفظ الطلب، لكنه لم يُرسل إلى شركة الشحن بعد: راجع الشركة قبل الإرسال مرة أخرى';

export function carrierSendNeedsAttention(carrierSend?: CarrierSendBlock | null): boolean {
  return !!carrierSend && (carrierSend.state !== 'SENT' || carrierSend.held);
}
