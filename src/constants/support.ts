export const SUPPORT_WHATSAPP = (
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? ''
).replace(/\D/g, '');

export const buildSupportWhatsAppUrl = (message: string) =>
  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
