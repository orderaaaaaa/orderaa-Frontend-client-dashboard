import type { CarrierSendBlock } from '@/types/manual-order';

const CARRIER_SEND_NOT_SENT_SENTENCE = 'لكنه لم يُرسل إلى شركة الشحن بعد: راجع الشركة قبل الإرسال مرة أخرى';

export const CARRIER_SEND_NOT_SENT_WARNING = `تم حفظ الطلب، ${CARRIER_SEND_NOT_SENT_SENTENCE}`;

export const carrierSendNotSentWarningAfter = (lead: string): string =>
  `${lead}، ${CARRIER_SEND_NOT_SENT_SENTENCE}`;

export function carrierSendNeedsAttention(carrierSend?: CarrierSendBlock | null): boolean {
  return !!carrierSend && (carrierSend.state !== 'SENT' || carrierSend.held);
}
