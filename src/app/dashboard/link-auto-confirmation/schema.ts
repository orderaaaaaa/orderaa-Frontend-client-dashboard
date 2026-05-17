import { z } from 'zod';

export const autoConfirmationConfigSchema = z.object({
  apiKey: z.string().min(1, 'يرجى إدخال مفتاح API'),
  accountId: z.string().optional(),
  isActive: z.boolean(),
});

export type AutoConfirmationFormData = z.infer<
  typeof autoConfirmationConfigSchema
>;
