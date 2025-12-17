import { z } from 'zod';

// Employee role enum - matching backend: SUPER_ADMIN, ADMIN, MANAGER
export const EmployeeRole = z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);

// Employee department enum - matching backend: CONFIRMATION, FOLLOW_UP, RETURNS
export const EmployeeDepartment = z.enum(['CONFIRMATION', 'FOLLOW_UP', 'RETURNS']);

// Employee form schema
export const employeeFormSchema = z.object({
  // Basic info
  accessLevel: z.string().min(1, { message: 'مستوى الصلاحية مطلوب' }),
  department: z.string().min(1, { message: 'القسم الإداري مطلوب' }),

  // Contact info
  fullName: z.string().min(2, { message: 'الاسم الكامل يجب أن يكون حرفين على الأقل' }),
  phoneNumber: z.string()
    .min(10, { message: 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل' })
    .regex(/^[0-9]+$/, { message: 'رقم الهاتف يجب أن يحتوي على أرقام فقط' }),

  // Location
  address: z.string().min(3, { message: 'العنوان مطلوب' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }).optional().or(z.literal('')),

  // Password
  password: z.string()
    .min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
  confirmPassword: z.string()
    .min(6, { message: 'تأكيد كلمة المرور مطلوب' }),

  // Work schedule
  workingHours: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
  path: ['confirmPassword'],
});

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Export alias for compatibility
export const employeeSchema = employeeFormSchema;

// Employee response type
export interface Employee {
  id: number;
  accessLevel: string;
  department: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  email?: string;
  workingHours?: string;
  isOnline?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeesResponse {
  success: boolean;
  data: Employee[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



