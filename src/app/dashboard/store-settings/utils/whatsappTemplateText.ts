import type { WhatsAppTemplatePlaceholder } from '@/types/whatsappTemplates';

export const WHATSAPP_TEMPLATE_MAX_LENGTH = 1000;

export const WHATSAPP_PLACEHOLDERS: readonly WhatsAppTemplatePlaceholder[] = [
  'customerName',
  'shippingCode',
  'customerPhone',
  'courierName',
];

export const WHATSAPP_PLACEHOLDER_LABELS: Record<WhatsAppTemplatePlaceholder, string> = {
  customerName: 'اسم العميل',
  shippingCode: 'رقم الشحنة',
  customerPhone: 'هاتف العميل',
  courierName: 'اسم المندوب',
};

export const PREVIEW_SAMPLE: Record<WhatsAppTemplatePlaceholder, string> = {
  customerName: 'منى أحمد',
  shippingCode: 'TB-778',
  customerPhone: '01012345678',
  courierName: 'محمود',
};

const TOKEN_PATTERN = /\{([A-Za-z0-9_]+)\}/g;
const KNOWN_TOKEN_PATTERN = /\{(customerName|shippingCode|customerPhone|courierName)\}/g;
const KNOWN_PLACEHOLDERS = new Set<string>(WHATSAPP_PLACEHOLDERS);

export const countCodePoints = (text: string) => Array.from(text).length;

export const splitPlaceholderTokens = (text: string) => text.split(/(\{[A-Za-z0-9_]+\})/);

export const fillPlaceholders = (
  text: string,
  values: Record<WhatsAppTemplatePlaceholder, string>
) => text.replace(KNOWN_TOKEN_PATTERN, (_, name: WhatsAppTemplatePlaceholder) => values[name]);

export const findUnknownPlaceholders = (text: string) =>
  Array.from(
    new Set(
      Array.from(text.matchAll(TOKEN_PATTERN), (match) => match[1]).filter(
        (name) => !KNOWN_PLACEHOLDERS.has(name)
      )
    )
  );
