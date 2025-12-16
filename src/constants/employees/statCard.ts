export interface StatCardConfig {
  title: string;
  accessLevel: string;
  borderColor?: string;
  iconBgColor: string;
  iconPath: string;
  alt?: string; // Optional alt text
}

export const STAT_CARDS: StatCardConfig[] = [
  {
    title: 'موظف',
    accessLevel: 'EMPLOYEE',
    borderColor: 'border-[#C9E9D2]',
    iconBgColor: 'bg-[#fbfdfb]',
    iconPath: '/icons/employee.svg',
  },
  {
    title: 'مدير',
    accessLevel: 'MANAGER',
    borderColor: 'border-[#D2E0FB]',
    iconBgColor: 'bg-[#fbfdff]',
    iconPath: '/icons/manager.svg',
    alt: 'Manager icon',
  },
  {
    title: 'ادمن',
    accessLevel: 'ADMIN',
    borderColor: 'border-[#2489E114]',
    iconBgColor: 'bg-[#edf6fd]',
    iconPath: '/icons/admin.svg',
    alt: 'Admin icon',
  },
  {
    title: 'سوبر ادمن',
    accessLevel: 'SUPER_ADMIN',
    borderColor: 'border-[#5D24E114]',
    iconBgColor: 'bg-[#f2edfd]',
    iconPath: '/icons/super-admin.svg',
    alt: 'Super Admin icon',
  },
  {
    title: 'إجمالي الموظفين',
    accessLevel: 'TOTAL',
    borderColor: 'border-[#2489E114]',
    iconBgColor: 'bg-[#edf6fd]',
    iconPath: '/icons/total-employees.svg',
    alt: 'Total Employees icon',
  },
];
