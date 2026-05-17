import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js/mobile';

export const signUpSchema = z
  .object({
    username: z.string().min(1, 'من فضلك ادخل اسمك'),
    merchantName: z.string().min(1, 'من فضلك ادخل اسم متجرك'),
    email: z.string().email('من فضلك أدخل بريدًا إلكترونيًا صحيحًا.'),
    phoneNumber: z
      .string()
      .min(1, 'من فضلك أدخل رقم الموبايل')
      .refine(
        (val) => isValidPhoneNumber(val, 'EG'),
        'رقم الموبايل غير صحيح. مثال: 01012345678'
      ),
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 حروف على الأقل.'),
    confirmPassword: z.string().min(1, 'من فضلك أكد كلمة المرور'),
    category: z.string().min(1, 'من فضلك اختر نوع النشاط'),
    governorate: z.string().min(1, 'من فضلك اختر المحافظة'),
    city: z.string().min(1, 'من فضلك اختر المدينة'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين.',
    path: ['confirmPassword'],
  });

export type SignUpSchema = z.infer<typeof signUpSchema>;
