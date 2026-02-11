import { z } from 'zod';
import {
  validateEgyptianPhoneNumber,
  getPhoneNumberErrorMessage,
} from '@/utils/validators/phoneValidator';

export const employeeSchema = z
  .object({
    accessLevel: z.string().min(1, 'يرجى اختيار صلاحية الموظف'),
    department: z.string().min(1, 'يرجى اختيار القسم'),
    fullName: z.string().min(1, 'الاسم الكامل مطلوب'),
    phoneNumber: z.string().refine(
      (val) => !val || validateEgyptianPhoneNumber(val),
      (val) => ({ message: getPhoneNumberErrorMessage(val) })
    ),
    email: z
      .string()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('البريد الإلكتروني غير صحيح'),
    address: z.string().nullish(),
    password: z.string().nullish(),
    passwordConfirmation: z.string().nullish(),
    workingHours: z.string().nullish(),
  })
  .refine(
    (data) =>
      !data.password ||
      data.password.trim() === '' ||
      data.password === data.passwordConfirmation,
    {
      message: 'الباسورد غير متطابق',
      path: ['passwordConfirmation'],
    }
  );

export type EmployeeFormData = z.infer<typeof employeeSchema>;
