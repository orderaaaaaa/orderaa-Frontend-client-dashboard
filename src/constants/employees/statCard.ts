export interface StatCardConfig {
  title: string;
  accessLevel: string;
  iconBgColor: string;
  iconPath: string;
  alt?: string; // Optional alt text
}

export const STAT_CARDS: StatCardConfig[] = [
  {
    title: 'موظف',
    accessLevel: 'EMPLOYEE',
    iconBgColor: 'bg-gray-50',
    iconPath: '/icons/employee.svg',
    alt: 'Employee icon',
  },
  {
    title: 'مدير',
    accessLevel: 'MANAGER',
    iconBgColor: 'bg-gray-50',
    iconPath: '/icons/manager.svg',
    alt: 'Manager icon',
  },
  {
    title: 'ادمن',
    accessLevel: 'ADMIN',
    iconBgColor: 'bg-blue-50',
    iconPath: '/icons/admin.svg',
    alt: 'Admin icon',
  },
  {
    title: 'سوبر ادمن',
    accessLevel: 'SUPER_ADMIN',
    iconBgColor: 'bg-purple-50',
    iconPath: '/icons/super-admin.svg',
    alt: 'Super Admin icon',
  },
  {
    title: 'إجمالي الموظفين',
    accessLevel: 'TOTAL',
    iconBgColor: 'bg-blue-50',
    iconPath: '/icons/total-employees.svg',
    alt: 'Total Employees icon',
  },
];
