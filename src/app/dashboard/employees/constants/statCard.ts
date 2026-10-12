import { StatCardConfig } from '../types/stat.types';
import { ACCESS_LEVEL_LABELS } from './accessLevels';

export const STAT_CARDS: StatCardConfig[] = [
  {
    title: 'إجمالي الموظفين',
    accessLevel: 'TOTAL',
    borderColor: 'border-[#2489E114]',
    iconBgColor: 'bg-[#edf6fd]',
    iconPath: '/Icons/total-employees.svg',
    alt: 'Total Employees icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.EMPLOYEE,
    accessLevel: 'EMPLOYEE',
    borderColor: 'border-[#C9E9D2]',
    iconBgColor: 'bg-[#fbfdfb]',
    iconPath: '/Icons/employee.svg',
  },
  {
    title: ACCESS_LEVEL_LABELS.MANAGER,
    accessLevel: 'MANAGER',
    borderColor: 'border-[#D2E0FB]',
    iconBgColor: 'bg-[#fbfdff]',
    iconPath: '/Icons/manager.svg',
    alt: 'Manager icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.ADMIN,
    accessLevel: 'ADMIN',
    borderColor: 'border-[#2489E114]',
    iconBgColor: 'bg-[#edf6fd]',
    iconPath: '/Icons/admin.svg',
    alt: 'Admin icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.SUPER_ADMIN,
    accessLevel: 'SUPER_ADMIN',
    borderColor: 'border-[#5D24E114]',
    iconBgColor: 'bg-[#f2edfd]',
    iconPath: '/Icons/super-admin.svg',
    alt: 'Super Admin icon',
  },
];
