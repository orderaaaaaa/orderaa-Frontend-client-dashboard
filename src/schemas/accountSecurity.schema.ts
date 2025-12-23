import { z } from 'zod';

export const accountSecuritySchema = z
  .object({
    oldPassword: z.string().min(1, { message: 'كلمة المرور القديمة مطلوبة' }),
    password: z
      .string()
      .min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
    confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
    path: ['confirmPassword'],
  });

export type AccountSecurityFormData = z.infer<typeof accountSecuritySchema>;
