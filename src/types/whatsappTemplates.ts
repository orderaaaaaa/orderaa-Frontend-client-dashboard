import type { ShipmentWhatsAppTemplateType } from '@/types/shippingProviders';

export type WhatsAppTemplateKind = ShipmentWhatsAppTemplateType;

export type WhatsAppTemplatePlaceholder =
  | 'customerName'
  | 'shippingCode'
  | 'customerPhone'
  | 'courierName';

export interface WhatsAppTemplate {
  kind: WhatsAppTemplateKind;
  body: string | null;
  defaultBody: string;
  placeholders: WhatsAppTemplatePlaceholder[];
}

export interface WhatsAppTemplatesResponse {
  templates: WhatsAppTemplate[];
}

export interface UpdateWhatsAppTemplatePayload {
  kind: WhatsAppTemplateKind;
  body: string | null;
}

export interface UpdateWhatsAppTemplatesPayload {
  templates: UpdateWhatsAppTemplatePayload[];
}
