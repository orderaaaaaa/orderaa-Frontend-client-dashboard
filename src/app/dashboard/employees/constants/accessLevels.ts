export const EMPLOYEE_ACCESS_LEVELS = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'] as const;

export type EmployeeAccessLevel = (typeof EMPLOYEE_ACCESS_LEVELS)[number];

export const ACCESS_LEVEL_LABELS: Record<EmployeeAccessLevel, string> = {
  SUPER_ADMIN: 'سوبر أدمن',
  ADMIN: 'أدمن',
  MANAGER: 'مدير',
  EMPLOYEE: 'موظف',
};

export const isEmployeeAccessLevel = (value: string): value is EmployeeAccessLevel =>
  (EMPLOYEE_ACCESS_LEVELS as readonly string[]).includes(value);
