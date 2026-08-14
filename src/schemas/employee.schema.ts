import { z } from 'zod';
import { validateEgyptianPhoneNumber } from '@/utils/validators/phoneValidator';
import type { EmployeeRoleRef } from '@/lib/api/authorization';

// Employee role enum - matching backend: SUPER_ADMIN, ADMIN, MANAGER
export const EmployeeRole = z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);

// Employee department enum - matching backend: CONFIRMATION, FOLLOW_UP, RETURNS
export const EmployeeDepartment = z.enum([
  'CONFIRMATION',
  'FOLLOW_UP',
  'RETURNS',
]);

// Employee form schema
export const employeeFormSchema = z
  .object({
    // Basic info
    accessLevel: z.string().min(1, { message: 'مستوى الصلاحية مطلوب' }),
    department: z.string().min(1, { message: 'القسم الإداري مطلوب' }),

    // Contact info
    fullName: z
      .string()
      .min(2, { message: 'الاسم الكامل يجب أن يكون حرفين على الأقل' }),
    phoneNumber: z
      .string()
      .min(1, { message: 'رقم الهاتف مطلوب' })
      .refine((val) => validateEgyptianPhoneNumber(val), {
        message: 'رقم الهاتف يجب أن يكون 11 رقم ويبدأ بـ 01',
      }),

    // Location
    address: z.string().min(3, { message: 'العنوان مطلوب' }),
    email: z
      .string()
      .email({ message: 'البريد الإلكتروني غير صحيح' })
      .optional()
      .or(z.literal('')),

    // Password
    password: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),

    confirmPassword: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((val) => (val === '' ? undefined : val)),
    // Work schedule
    workingHours: z.string().optional(),

    // ABAC roles — role ids as strings so the shared MultiSelectDropdown can
    // drive them; `employeesApi.create` converts them to the numeric
    // `roleIds[]` the backend CreateEmployeeDto expects.
    roleIds: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين',
      path: ['confirmPassword'],
    }
  );

export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

// Export alias for compatibility
export const employeeSchema = employeeFormSchema;

/**
 * Create-form schema. Under ABAC an employee with zero roles can sign in but
 * gets a 403 on every request, so the create form must not produce one.
 *
 * `requireRoles` mirrors whether the roles multi-select is actually rendered
 * (the creator holds `roles:read` + `roles:assign`):
 * - `true`  → at least one role must be picked before submitting.
 * - `false` → the field is hidden, so the requirement cannot be satisfied here;
 *   the form shows a notice that an admin has to assign roles instead.
 *
 * The edit flow keeps its own schema
 * (`employees/employee-settings/[employeeSettingId]/schemas/employee.ts`) and is
 * untouched — roles there are managed by `PUT /employees/:id/roles`, so an
 * untouched roles field is legitimate.
 */
export const buildCreateEmployeeSchema = (requireRoles: boolean) =>
  employeeFormSchema.superRefine((data, ctx) => {
    if (requireRoles && (data.roleIds?.length ?? 0) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['roleIds'],
        message: 'يجب اختيار دور واحد على الأقل للموظف',
      });
    }
  });

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
  page?: number;
  limit?: number;
}

export interface EmployeeSummary {
  byRole: { role: string; count: number }[];
  totalEmployees: number;
}
