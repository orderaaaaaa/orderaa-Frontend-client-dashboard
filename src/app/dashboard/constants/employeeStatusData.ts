import type { EmployeeStatusRow } from '../types';

export const MOCK_EMPLOYEE_STATUS: EmployeeStatusRow[] = [
  {
    id: 1,
    name: 'هدي',
    status: 'stopped',
    lastInactivityDuration: '3 دقائق',
    totalInactivityToday: 5,
    totalAttempts: 42,
  },
  {
    id: 2,
    name: 'محمد',
    status: 'stopped',
    lastInactivityDuration: '3 دقائق',
    totalInactivityToday: 3,
    totalAttempts: 42,
  },
  {
    id: 3,
    name: 'مهند',
    status: 'stopped',
    lastInactivityDuration: '3 دقائق',
    totalInactivityToday: 4,
    totalAttempts: 42,
  },
  {
    id: 4,
    name: 'مني',
    status: 'stopped',
    lastInactivityDuration: '3 دقائق',
    totalInactivityToday: 2,
    totalAttempts: 42,
  },
];
