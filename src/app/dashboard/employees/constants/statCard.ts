import { StatCardConfig } from '../types/stat.types';
import { ACCESS_LEVEL_LABELS } from './accessLevels';

export const STAT_CARDS: StatCardConfig[] = [
  {
    title: 'إجمالي الموظفين',
    accessLevel: 'TOTAL',
    borderColor: 'border-blue-500/10',
    iconBgColor: 'bg-blue-50',
    iconPath: '/Icons/total-employees.svg',
    alt: 'Total Employees icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.EMPLOYEE,
    accessLevel: 'EMPLOYEE',
    borderColor: 'border-green-200',
    iconBgColor: 'bg-card',
    iconPath: '/Icons/employee.svg',
  },
  {
    title: ACCESS_LEVEL_LABELS.MANAGER,
    accessLevel: 'MANAGER',
    borderColor: 'border-blue-200',
    iconBgColor: 'bg-blue-50',
    iconPath: '/Icons/manager.svg',
    alt: 'Manager icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.ADMIN,
    accessLevel: 'ADMIN',
    borderColor: 'border-blue-500/10',
    iconBgColor: 'bg-blue-50',
    iconPath: '/Icons/admin.svg',
    alt: 'Admin icon',
  },
  {
    title: ACCESS_LEVEL_LABELS.SUPER_ADMIN,
    accessLevel: 'SUPER_ADMIN',
    borderColor: 'border-primary/10',
    iconBgColor: 'bg-primary/10',
    iconPath: '/Icons/super-admin.svg',
    alt: 'Super Admin icon',
  },
];
