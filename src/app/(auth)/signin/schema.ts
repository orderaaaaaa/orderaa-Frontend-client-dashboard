import { z } from 'zod';

export const signInSchema = z.object({
  emailOrPhoneNumber: z
    .string()
    .min(1, 'من فضلك أدخل البريد الإلكتروني أو رقم الموبايل.')
    .refine(
      (value) =>
        /^\d{10,15}$/.test(value) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      'من فضلك أدخل بريدًا إلكترونيًا صحيحًا أو رقم موبايل صحيح.'
    ),
  password: z.string().min(1, 'من فضلك أدخل كلمة المرور.'),
});

export type SignInSchema = z.infer<typeof signInSchema>;
