import { z } from 'zod';

const EGYPTIAN_MOBILE = /^01\d{9}$/;
const INTERNATIONAL_PHONE = /^\d{10,15}$/;
const PHONE_CHARACTERS = /^[\d\u0660-\u0669\u06F0-\u06F9\s+\-.()/]+$/;

const normalizePhoneNumber = (phone: string) => {
  let digits = phone
    .replace(/[\u06F0-\u06F9]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/g, (c) => String(c.charCodeAt(0) - 0x0660))
    .replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('20')) digits = digits.slice(2);
  if (digits.length === 10 && !digits.startsWith('0')) digits = `0${digits}`;
  return digits;
};

export const phoneNumberErrorOf = (phone: string): string | null => {
  if (phone.trim() === '') return null;
  if (!PHONE_CHARACTERS.test(phone.trim())) {
    return 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
  }
  const value = normalizePhoneNumber(phone);
  if (value.startsWith('01')) {
    return EGYPTIAN_MOBILE.test(value)
      ? null
      : `رقم الهاتف المصري يجب أن يكون 11 رقم (الرقم الحالي ${value.length} أرقام)`;
  }
  return INTERNATIONAL_PHONE.test(value)
    ? null
    : 'الرقم الدولي يجب أن يكون من 10 إلى 15 رقم';
};

const amountIssueOf = (value: string | undefined): string | null => {
  const raw = value?.trim() ?? '';
  if (raw === '') return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount)) return 'يرجى إدخال رقم صحيح';
  if (amount < 0) return 'لا يمكن أن تكون القيمة سالبة';
  return null;
};

export const manualOrderBaseSchema = z
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
      shippingCompanyId: z.string().min(1, 'يرجى اختيار شركة الشحن'),
      governorateOption: z.string().min(1, 'يرجى اختيار المحافظة'),
      cityOption: z.string().min(1, 'يرجى اختيار المدينة'),
      shippingCost: z.string().optional(),
      returnShippingCost: z.string().min(1, 'هذا الحقل مطلوب'),
      shippingType: z.string().min(1, 'يرجى اختيار نوع الشحنة'),
      returnShipmentContent: z.string().optional(),
    }),
    payment: z.object({
      paymentMethod: z.string().min(1, 'يرجى اختيار طريقة الدفع'),
    }),
    needsConfirmation: z.boolean(),
    total: z.string().optional(),
    packagingNotes: z.string().optional(),
  });

export const manualOrderSchema = manualOrderBaseSchema.superRefine((data, ctx) => {
    data.customer.phoneNumbers.forEach((phone, index) => {
      const message = phoneNumberErrorOf(phone);
      if (message) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message,
          path: ['customer', 'phoneNumbers', index],
        });
      }
    });
    const amountFields = [
      [data.shipping.shippingCost, ['shipping', 'shippingCost']],
      [data.shipping.returnShippingCost, ['shipping', 'returnShippingCost']],
      [data.total, ['total']],
    ] as const;
    amountFields.forEach(([value, path]) => {
      const message = amountIssueOf(value);
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [...path] });
      }
    });
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
  });

export type ManualOrderFormData = z.infer<typeof manualOrderSchema>;
