import type {
  EmployeeStatusRow,
  EmployeeStopDetailData,
} from '../types';

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

export const employeeStopDetailsData: Record<number, EmployeeStopDetailData> = {
  1: {
    id: 1,
    employeeId: 1,
    status: 'stopped',
    stopTimes: [
      { from: '10:00 AM', to: '10:15 AM' },
      { from: '10:40 AM', to: '10:54 AM' },
      { from: '11:03 AM', to: '11:12 AM' },
      { from: '11:45 AM', to: '12:00 PM' },
      { from: '12:15 PM', to: '12:20 AM' },
      { from: '12:40 PM', to: '12:45 PM' },
      { from: '01:00 PM', to: '01:10 PM' },
      { from: '01:45 PM', to: '11:45 AM' },
      { from: '10:00 AM', to: '10:00 AM' },
      { from: '11:45 AM', to: '11:45 AM' },
    ],
    totalStopToday: '30 دقيقه',
    totalAttempts: 23,
  },
  2: {
    id: 2,
    employeeId: 2,
    status: 'stopped',
    stopTimes: [
      { from: '09:30 AM', to: '09:45 AM' },
      { from: '11:00 AM', to: '11:20 AM' },
      { from: '02:00 PM', to: '02:15 PM' },
    ],
    totalStopToday: '50 دقيقه',
    totalAttempts: 35,
  },
  3: {
    id: 3,
    employeeId: 3,
    status: 'stopped',
    stopTimes: [
      { from: '10:15 AM', to: '10:30 AM' },
      { from: '12:30 PM', to: '12:45 PM' },
      { from: '03:00 PM', to: '03:20 PM' },
      { from: '04:15 PM', to: '04:25 PM' },
    ],
    totalStopToday: '55 دقيقه',
    totalAttempts: 28,
  },
  4: {
    id: 4,
    employeeId: 4,
    status: 'stopped',
    stopTimes: [
      { from: '09:00 AM', to: '09:10 AM' },
      { from: '11:30 AM', to: '11:45 AM' },
    ],
    totalStopToday: '25 دقيقه',
    totalAttempts: 40,
  },
};

export interface EmployeeStopChartData {
  categories: string[];
  series: { name: string; data: number[] }[];
}

export const employeeStopChartData: Record<number, EmployeeStopChartData> = {
  1: {
    categories: ['9 ص', '10 ص', '11 ص', '12 م', '1 م', '2 م', '3 م', '4 م'],
    series: [
      { name: 'مدة التوقف (دقيقة)', data: [0, 15, 14, 9, 15, 5, 5, 10] },
    ],
  },
  2: {
    categories: ['9 ص', '10 ص', '11 ص', '12 م', '1 م', '2 م', '3 م'],
    series: [{ name: 'مدة التوقف (دقيقة)', data: [15, 0, 20, 0, 0, 15, 0] }],
  },
  3: {
    categories: ['10 ص', '11 ص', '12 م', '1 م', '2 م', '3 م', '4 م'],
    series: [{ name: 'مدة التوقف (دقيقة)', data: [15, 0, 15, 0, 0, 20, 10] }],
  },
  4: {
    categories: ['9 ص', '10 ص', '11 ص', '12 م'],
    series: [{ name: 'مدة التوقف (دقيقة)', data: [10, 0, 15, 0] }],
  },
};
