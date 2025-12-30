import { z } from 'zod';

export const orderSettingsSchema = z
  .object({
    phoneNumber: z
      .string()
      .min(11, 'يجب أن يكون رقم الهاتف 11 رقم على الأقل')
      .max(12, 'يجب أن لا يتجاوز رقم الهاتف 12 رقم'),
    canOpenOrder: z.boolean().default(false),
    canEditOrder: z.boolean().default(false),
    category: z.string().optional(),
    returnShippingCost: z.string().optional(), // Added field
  })
  .refine(
    (data) => {
      if (data.canEditOrder === false && !data.category) {
        return false;
      }
      return true;
    },
    {
      message: 'القسم مطلوب عند عدم تفعيل التعديل',
      path: ['category'],
    }
  );

export type OrderSettingsFormData = z.infer<typeof orderSettingsSchema>;
