import { z } from 'zod';

export const manualOrderSchema = z
  .object({
    orderSource: z.object({
      utmSource: z.string().min(1, 'هذا الحقل مطلوب'),
      pageName: z.string().min(1, 'هذا الحقل مطلوب'),
    }),
    customer: z.object({
      name: z.string().min(1, 'هذا الحقل مطلوب'),
      phoneNumbers: z
        .array(z.string())
        .min(1, 'يجب إضافة رقم هاتف واحد على الأقل')
        .max(2, 'الحد الأقصى رقمين')
        .refine((phones) => phones.some((p) => p.trim() !== ''), {
          message: 'يجب إدخال رقم هاتف واحد على الأقل',
        }),
      address: z.string().min(1, 'هذا الحقل مطلوب'),
      notes: z.string().optional(),
    }),
    shipping: z.object({
      shippingCompany: z.string().min(1, 'يرجى اختيار شركة الشحن'),
      governorate: z.string().min(1, 'يرجى اختيار المحافظة'),
      city: z.string().min(1, 'يرجى اختيار المدينة'),
      shippingCost: z.string().optional(),
      shippingType: z.string().min(1, 'يرجى اختيار نوع الشحنة'),
      returnShipmentContent: z.string().optional(),
    }),
    payment: z.object({
      paymentMethod: z.string().min(1, 'يرجى اختيار طريقة الدفع'),
    }),
    needsConfirmation: z.boolean(),
    total: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shipping.shippingCost && isNaN(Number(data.shipping.shippingCost))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال رقم صحيح',
        path: ['shipping', 'shippingCost'],
      });
    }
    const requiresReturnContent = ['PARTIAL_RETURN', 'EXCHANGE', 'RETURN'].includes(
      data.shipping.shippingType
    );
    if (requiresReturnContent && !data.shipping.returnShipmentContent?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال محتوى شحنة الاسترجاع',
        path: ['shipping', 'returnShipmentContent'],
      });
    }
    if (data.total && isNaN(Number(data.total))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'يرجى إدخال رقم صحيح',
        path: ['total'],
      });
    }
  });

export type ManualOrderFormData = z.infer<typeof manualOrderSchema>;
