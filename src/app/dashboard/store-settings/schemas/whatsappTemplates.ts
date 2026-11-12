import { z } from 'zod';
import {
  WHATSAPP_TEMPLATE_MAX_LENGTH,
  countCodePoints,
  findUnknownPlaceholders,
} from '../utils/whatsappTemplateText';

const templateTextSchema = z
  .string()
  .refine(
    (text) => countCodePoints(text) <= WHATSAPP_TEMPLATE_MAX_LENGTH,
    `النص أطول من ${WHATSAPP_TEMPLATE_MAX_LENGTH} حرف`
  )
  .superRefine((text, ctx) => {
    findUnknownPlaceholders(text).forEach((name) =>
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `متغير غير معروف: {${name}}`,
      })
    );
  });

export const whatsappTemplatesSchema = z.object({
  SHIPMENT_CUSTOMER: templateTextSchema,
  SHIPMENT_COURIER: templateTextSchema,
});

export type WhatsAppTemplatesFormData = z.infer<typeof whatsappTemplatesSchema>;
