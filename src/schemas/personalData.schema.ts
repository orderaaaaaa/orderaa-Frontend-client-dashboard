import { z } from 'zod';
import { validateEgyptianPhoneNumber } from '@/utils/validators/phoneValidator';

export const personalDataSchema = z.object({
  fullName: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'الاسم الكامل يجب أن يكون حرفين على الأقل',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'البريد الإلكتروني غير صحيح',
    }),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || validateEgyptianPhoneNumber(val), {
      message: 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01',
    }),
  governorate: z.string().optional(),
  city: z.string().optional(),
});

export type PersonalDataFormData = z.infer<typeof personalDataSchema>;
