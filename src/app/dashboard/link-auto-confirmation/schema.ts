import { z } from 'zod';

export const autoConfirmationConfigSchema = (requiresApiKey: boolean) =>
  z.object({
    apiKey: requiresApiKey
      ? z.string().min(1, 'يرجى إدخال مفتاح API')
      : z.string().optional(),
    accountId: z.string().optional(),
    isActive: z.boolean(),
  });

export type AutoConfirmationFormData = z.infer<
  ReturnType<typeof autoConfirmationConfigSchema>
>;
