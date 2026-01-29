import type {
  EmployeeStatusRow,
  CallDurationItem,
  OrderStatusDistributionItem,
  ConfirmationAttemptsData,
  EmployeeModalData,
  FollowUpModalData,
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

export const CALL_DURATIONS: CallDurationItem[] = [
  {
    key: 'confirmed',
    label: 'المكالمات المؤكده',
    value: '3 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [40, 42, 43, 45] },
      { name: 'series2', data: [35, 38, 40, 42] },
    ],
  },
  {
    key: 'cancelled',
    label: 'المكالمات الملغاه',
    value: '3 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [45, 44, 42, 40] },
      { name: 'series2', data: [42, 43, 44, 45] },
    ],
  },
  {
    key: 'followUp',
    label: 'المكالمات الخاصه بالمتابعة',
    value: '4 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [30, 35, 38, 42] },
      { name: 'series2', data: [28, 30, 32, 35] },
    ],
  },
  {
    key: 'incomplete',
    label: 'المكالمات غير المكتمله',
    value: '1 دقيقه',
    chartCategories: ['02:55:00', '03:00:00', '03:05:00', '03:10:00'],
    chartSeries: [
      { name: 'series1', data: [38, 40, 42, 45] },
      { name: 'series2', data: [35, 37, 39, 41] },
    ],
  },
];

export const ORDER_STATUS_DISTRIBUTION: OrderStatusDistributionItem[] = [
  { label: 'طلب جديد', value: 120, color: '#3b82f6' },
  { label: 'تمت المحاولة', value: 45, color: '#8b5cf6' },
  { label: 'بانتظار الدفع', value: 30, color: '#f59e0b' },
  { label: 'واتساب', value: 25, color: '#22c55e' },
  { label: 'مؤجل', value: 18, color: '#6366f1' },
  { label: 'اعادة اتصال', value: 35, color: '#14b8a6' },
  { label: 'ملغى', value: 60, color: '#ef4444' },
  { label: 'غير مكتمل', value: 40, color: '#f97316' },
  { label: 'مؤكد', value: 99, color: '#10b981' },
  { label: 'تم التسليم', value: 89, color: '#ec4899' },
];

export const CONFIRMATION_ATTEMPTS: ConfirmationAttemptsData = {
  categories: [
    'محاوله اولي',
    'محاوله تانيه',
    'محاوله تالته',
    'محاوله رابعه',
    'محاوله خامسه',
  ],
  values: [40, 10, 100, 30, 50],
};

export const activeEmployeesData: EmployeeModalData[] = [
  {
    id: 1,
    name: 'احمد',
    status: 'active',
    totalWorkHours: '7 ساعات و 40 دقيقه',
    attempts: 34,
  },
  {
    id: 2,
    name: 'يارا',
    status: 'active',
    totalWorkHours: '7 ساعات و 40 دقيقه',
    attempts: 34,
  },
  {
    id: 3,
    name: 'علي',
    status: 'active',
    totalWorkHours: '7 ساعات و 40 دقيقه',
    attempts: 34,
  },
  {
    id: 4,
    name: 'محمد',
    status: 'active',
    totalWorkHours: '7 ساعات و 40 دقيقه',
    attempts: 34,
  },
];

export const stoppedEmployeesData: EmployeeModalData[] = [
  {
    id: 5,
    name: 'سارة',
    status: 'stopped',
    totalWorkHours: '3 ساعات و 15 دقيقه',
    attempts: 12,
  },
  {
    id: 6,
    name: 'خالد',
    status: 'stopped',
    totalWorkHours: '5 ساعات و 20 دقيقه',
    attempts: 22,
  },
  {
    id: 7,
    name: 'فاطمة',
    status: 'stopped',
    totalWorkHours: '2 ساعات و 45 دقيقه',
    attempts: 8,
  },
  {
    id: 8,
    name: 'عمر',
    status: 'stopped',
    totalWorkHours: '4 ساعات و 30 دقيقه',
    attempts: 18,
  },
  {
    id: 9,
    name: 'نورة',
    status: 'stopped',
    totalWorkHours: '1 ساعه و 50 دقيقه',
    attempts: 6,
  },
];

export const followUpOrdersData: FollowUpModalData[] = [
  { id: 1, status: 'تأكيد', count: 156, percentage: '35%' },
  { id: 2, status: 'متابعة', count: 89, percentage: '20%' },
  { id: 3, status: 'لا يرد', count: 34, percentage: '8%' },
  { id: 4, status: 'مغلق', count: 18, percentage: '4%' },
  { id: 5, status: 'مش بيجمع', count: 25, percentage: '6%' },
  { id: 6, status: 'فتح وقفل', count: 23, percentage: '5%' },
  { id: 7, status: 'مستعجل', count: 15, percentage: '3%' },
  { id: 8, status: 'الغاء', count: 42, percentage: '9%' },
  { id: 9, status: 'رفض التعديل', count: 8, percentage: '2%' },
  { id: 10, status: 'تأجيل ساعات', count: 28, percentage: '6%' },
  { id: 11, status: 'تأجيل أيام', count: 22, percentage: '5%' },
  { id: 12, status: 'متابعة واتساب', count: 38, percentage: '8%' },
  { id: 13, status: 'وقف التشغيل', count: 12, percentage: '3%' },
  { id: 14, status: 'في انتظار الدفع', count: 19, percentage: '4%' },
];

export const cancelledOrdersData: FollowUpModalData[] = [
  { id: 1, status: 'العميل غير مهتم', count: 25, percentage: '25%' },
  { id: 2, status: 'السعر مرتفع', count: 18, percentage: '18%' },
  { id: 3, status: 'تغيير رأي العميل', count: 15, percentage: '15%' },
  { id: 4, status: 'طلب مكرر', count: 12, percentage: '12%' },
  { id: 5, status: 'المنتج غير متوفر', count: 10, percentage: '10%' },
  { id: 6, status: 'خطأ في البيانات', count: 8, percentage: '8%' },
  { id: 7, status: 'رقم خاطئ', count: 7, percentage: '7%' },
  { id: 8, status: 'أسباب أخرى', count: 5, percentage: '5%' },
];

export const incompleteOrdersData: FollowUpModalData[] = [
  { id: 1, status: 'رفض التعديل', count: 12, percentage: '15%' },
  { id: 2, status: 'تأجيل ساعات', count: 28, percentage: '35%' },
  { id: 3, status: 'تأجيل أيام', count: 18, percentage: '22%' },
  { id: 4, status: 'متابعة واتساب', count: 15, percentage: '19%' },
  { id: 5, status: 'في انتظار الدفع', count: 7, percentage: '9%' },
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
