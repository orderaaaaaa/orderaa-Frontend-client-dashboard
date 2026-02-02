import { z } from 'zod';

export const manualOrderSchema = z
  .object({
    orderSource: z.object({
      utmSource: z.string().min(1, 'هذا الحقل مطلوب'),
      pageName: z.string().min(1, 'هذا الحقل مطلوب'),
    }),
    customer: z.object({
      name: z.string().min(1, 'هذا الحقل مطلوب'),
      phoneNumber: z.string().min(1, 'هذا الحقل مطلوب'),
      address: z.string().min(1, 'هذا الحقل مطلوب'),
      notes: z.string().optional(),
    }),
    shipping: z.object({
      shippingCompany: z.string().min(1, 'يرجى اختيار شركة الشحن'),
      governorate: z.string().min(1, 'يرجى اختيار المحافظة'),
      city: z.string().min(1, 'يرجى اختيار المدينة'),
      shippingCost: z.string().min(1, 'يرجى إدخال تكلفة الشحن'),
    }),
    payment: z.object({
      paymentMethod: z.string().min(1, 'يرجى اختيار طريقة الدفع'),
    }),
    needsConfirmation: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.shipping.shippingCost && isNaN(Number(data.shipping.shippingCost))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال رقم صحيح',
        path: ['shipping', 'shippingCost'],
      });
    }
  });

export type ManualOrderFormData = z.infer<typeof manualOrderSchema>;
