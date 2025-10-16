import { z } from 'zod';

export const signUpSchema = z
  .object({
    username: z.string().min(1, 'من فضلك ادخل اسمك'),
    merchantName: z.string().min(1, 'من فضلك ادخل اسم متجرك'),
    email: z.string().email('من فضلك أدخل بريدًا إلكترونيًا صحيحًا.'),
    phoneNumber: z
      .string()
      .regex(/^\d{10,15}$/, 'رقم الموبايل يجب أن يكون من 10 إلى 15 رقمًا.'),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 حروف على الأقل.'),
    confirmPassword: z.string(),
    category: z.string().min(1, 'من فضلك اختر النشاط.'),
    governorate: z.string().min(1, 'من فضلك اختر المحافظة.'),
    city: z.string().min(1, 'من فضلك اختر المنطقة.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
