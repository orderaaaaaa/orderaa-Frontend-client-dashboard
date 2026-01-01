import { z } from 'zod';

export const orderSettingsSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (val.length >= 11 && val.length <= 12), {
      message: 'يجب أن يكون رقم الهاتف من 11 إلى 12 رقم',
    }),

  canOpenOrder: z.boolean().optional(),
  canEditOrder: z.boolean().optional(),

  category: z.string().optional(),
  returnShippingCost: z.string().optional(),

  autoCancelAttempts: z
    .union([z.number(), z.nan()])
    .optional()
    .transform((v) => (Number.isNaN(v) ? undefined : v)),
});

export type OrderSettingsFormData = z.infer<typeof orderSettingsSchema>;
