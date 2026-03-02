import { z } from 'zod';

export const addSupplierSchema = z.object({
  nickname: z.string().min(1, 'اللقب مطلوب'),
  officialName: z.string().min(1, 'الاسم الرسمي مطلوب'),
  phone: z
    .string()
    .min(1, 'رقم التواصل مطلوب')
    .regex(/^01[0-9]{9}$/, 'رقم التواصل غير صالح'),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      { message: 'البريد الالكتروني غير صالح' },
    ),
  governorate: z.string().min(1, 'المحافظة مطلوبة'),
});

export type AddSupplierFormData = z.infer<typeof addSupplierSchema>;
