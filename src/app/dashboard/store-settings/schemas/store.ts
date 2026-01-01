import { z } from 'zod';

export const orderSettingsSchema = z.object({
  shippingPhoneNumber: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (val.length >= 11 && val.length <= 13), {
      message: 'يجب أن يكون رقم الهاتف من 11 إلى 13 رقم',
    }),

  canOpenShipment: z.boolean().default(false), // Changed from canOpenOrder
  employeeCanEditContent: z.boolean().default(false), // Changed from canEditOrder

  defaultShipmentContent: z.string().optional(), // Changed from category
  defaultReturnShippingCost: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().optional()
  ), // Changed from returnShippingCost

  autoCancelAttempts: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().optional()
  ),
});

export type OrderSettingsFormData = z.infer<typeof orderSettingsSchema>;
