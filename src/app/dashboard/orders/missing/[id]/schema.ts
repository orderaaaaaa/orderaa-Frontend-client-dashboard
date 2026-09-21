import { z } from 'zod';
import { manualOrderBaseSchema } from '@/app/dashboard/upload-products/manual/schema';

export const recoverOrderSchema = manualOrderBaseSchema
  .extend({
    payment: z.object({
      paymentMethod: z.string().min(1, 'يرجى اختيار طريقة الدفع'),
      paymentStatus: z.enum(['PAID', 'CASH_ON_DELIVERY', 'PARTIALLY_PAID']),
      prepaidAmount: z.string(),
    }),
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
      data.shipping.shippingType,
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

    if (data.payment.paymentStatus !== 'CASH_ON_DELIVERY') {
      const amount = Number(data.payment.prepaidAmount);
      if (!data.payment.prepaidAmount || isNaN(amount) || amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'المبلغ يجب أن يكون أكبر من صفر',
          path: ['payment', 'prepaidAmount'],
        });
      } else {
        const total = Number(data.total) || 0;
        if (amount > total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'المبلغ يجب ألا يتجاوز إجمالي الطلب',
            path: ['payment', 'prepaidAmount'],
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'المبلغ يجب ألا يتجاوز إجمالي الطلب',
            path: ['total'],
          });
        }
      }
    }
  });

export type RecoverOrderFormData = z.infer<typeof recoverOrderSchema>;
