import { z } from 'zod';

export const manualOrderSchema = z.object({
  orderSource: z.object({
    platform: z.string().min(1, 'هذا الحقل مطلوب'),
    pageName: z.string().min(1, 'هذا الحقل مطلوب'),
  }),
  customer: z.object({
    customerName: z.string().min(1, 'هذا الحقل مطلوب'),
    phoneNumber: z.string().min(1, 'هذا الحقل مطلوب'),
    governorate: z.string().min(1, 'هذا الحقل مطلوب'),
    area: z.string().min(1, 'هذا الحقل مطلوب'),
    address: z.string().min(1, 'هذا الحقل مطلوب'),
    notes: z.string().optional(),
  }),
  shippingPayment: z.object({
    shipping: z.boolean(),
    shippingCompany: z.string().optional(),
    shippingCost: z.string(),
    includeShipping: z.boolean(),
    paymentMethod: z.string(),
    needsConfirmation: z.boolean(),
  }),
}).superRefine((data, ctx) => {
  if (data.shippingPayment.shipping) {
    if (!data.shippingPayment.shippingCost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال تكلفة الشحن',
        path: ['shippingPayment', 'shippingCost'],
      });
    } else if (isNaN(Number(data.shippingPayment.shippingCost))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال رقم صحيح',
        path: ['shippingPayment', 'shippingCost'],
      });
    }
  }

  if (data.shippingPayment.includeShipping && !data.shippingPayment.paymentMethod) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'يرجى اختيار طريقة الدفع',
      path: ['shippingPayment', 'paymentMethod'],
    });
  }
});

export type ManualOrderFormData = z.infer<typeof manualOrderSchema>;
