import type { CarrierSendBlock } from '@/types/manual-order';

const CARRIER_SEND_NOT_SENT_SENTENCE = 'لكنه لم يُرسل إلى شركة الشحن بعد: راجع الشركة قبل الإرسال مرة أخرى';

export const CARRIER_SEND_NOT_SENT_WARNING = `تم حفظ الطلب، ${CARRIER_SEND_NOT_SENT_SENTENCE}`;

const withCarrierText = (warning: string, carrierText?: string | null): string => {
  const text = carrierText?.trim();
  return text ? `${warning}: ${text}` : warning;
};

export const carrierSendWarningOf = (carrierSend: CarrierSendBlock): string =>
  withCarrierText(CARRIER_SEND_NOT_SENT_WARNING, carrierSend.carrierText);

export const carrierSendNotSentWarningAfter = (lead: string, carrierText?: string | null): string =>
  withCarrierText(`${lead}، ${CARRIER_SEND_NOT_SENT_SENTENCE}`, carrierText);

export function carrierSendNeedsAttention(carrierSend?: CarrierSendBlock | null): boolean {
  return !!carrierSend && (carrierSend.state !== 'SENT' || carrierSend.held);
}
