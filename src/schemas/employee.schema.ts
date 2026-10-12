import { z } from 'zod';
import {
  validateEgyptianPhoneNumber,
  getPhoneNumberErrorMessage,
} from '@/utils/validators/phoneValidator';
import type { EmployeeRoleRef } from '@/lib/api/authorization';
import {
  EMPLOYEE_ACCESS_LEVELS,
  isEmployeeAccessLevel,
} from '@/app/dashboard/employees/constants/accessLevels';

export const EmployeeRole = z.enum(EMPLOYEE_ACCESS_LEVELS);

export const EmployeeDepartment = z.enum([
  'CONFIRMATION',
  'FOLLOW_UP',
  'RETURNS',
]);

const PASSWORD_MIN_LENGTH = 6;

const employeeFieldsSchema = z.object({
  accessLevel: z
    .string()
    .min(1, { message: 'مستوى الوظيفة مطلوب' })
    .refine((value): boolean => value === '' || isEmployeeAccessLevel(value), {
      message: 'مستوى الوظيفة غير صحيح',
    }),
  department: z.string().min(1, { message: 'قسم الموظف مطلوب' }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'الاسم الكامل يجب أن يكون حرفين على الأقل' }),
  phoneNumber: z
    .string()
    .trim()
    .min(1, { message: 'رقم الهاتف مطلوب' })
    .superRefine((value, ctx) => {
      if (value && !validateEgyptianPhoneNumber(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: getPhoneNumberErrorMessage(value),
        });
      }
    }),
  email: z
    .string()
    .trim()
    .email({ message: 'البريد الإلكتروني غير صحيح' })
    .optional()
    .or(z.literal('')),
  address: z.string().nullish(),
  governorate: z.string().nullish(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  workingHours: z.string().nullish(),
  roleIds: z.array(z.string()).optional(),
});

type EmployeeFormMode = 'create' | 'edit';

const refinePasswords =
  (mode: EmployeeFormMode) =>
  (data: z.infer<typeof employeeFieldsSchema>, ctx: z.RefinementCtx) => {
    const password = data.password ?? '';
    const confirmPassword = data.confirmPassword ?? '';
    if (mode === 'create' && password === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'كلمة المرور مطلوبة',
      });
      return;
    }
    if (password !== '' && password.length < PASSWORD_MIN_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: `كلمة المرور يجب أن تكون ${PASSWORD_MIN_LENGTH} أحرف على الأقل`,
      });
    }
    if ((password !== '' || confirmPassword !== '') && password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
      });
    }
  };

export type EmployeeFormData = z.infer<typeof employeeFieldsSchema>;

export const editEmployeeSchema = employeeFieldsSchema.superRefine(
  refinePasswords('edit')
);

export const buildCreateEmployeeSchema = (requireRoles: boolean) =>
  employeeFieldsSchema.superRefine((data, ctx) => {
    refinePasswords('create')(data, ctx);
    if (requireRoles && (data.roleIds?.length ?? 0) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roleIds'],
        message: 'يجب اختيار دور واحد على الأقل للموظف',
      });
    }
  });

export const EMPLOYEE_FORM_DEFAULTS: EmployeeFormData = {
  accessLevel: '',
  department: '',
  fullName: '',
  phoneNumber: '',
  email: '',
  address: '',
  governorate: '',
  password: '',
  confirmPassword: '',
  workingHours: '',
  roleIds: [],
};

// Employee response type
export interface Employee {
  id: number;
  accessLevel: string;
  department: string;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  governorate?: string | null;
  city?: string | null;
  email?: string;
  workingHours?: string;
  isOnline?: boolean;
  /**
   * Account state. An inactive employee is refused on their next request.
   * Distinct from `isOnline`, which is presence tracking.
   */
  isActive?: boolean;
  performanceScore?: number;
  performanceChange?: number;
  workingDaysThisMonth?: number;
  leaveDaysThisMonth?: number;
  createdAt: string;
  updatedAt: string;
  /**
   * Roles assigned to the employee. Added by ABAC — `EmployeesService.findAll`
   * / `findOne` / `findFiltered` all embed `roles: { id, name }[]`.
   */
  roles?: EmployeeRoleRef[];
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

// Paginated employees response from filtered endpoint
export interface PaginatedEmployeesResponse {
  data: Employee[];
  meta: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Employee filter parameters
export interface EmployeeFilters {
  name?: string;
  phoneNumber?: string;
  email?: string;
  accessLevel?: string;
  department?: string;
  performance?: 'LOW' | 'HIGH' | 'ALL';
  /** Omit for both states; `true`/`false` narrows to active/inactive. */
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface EmployeeSummary {
  byRole: { role: string; count: number }[];
  totalEmployees: number;
}
