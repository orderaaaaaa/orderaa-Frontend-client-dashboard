import { ACCESS_LEVEL_LABELS, EMPLOYEE_ACCESS_LEVELS } from './accessLevels';

export const FILTER_ALL = 'ALL' as const;

export const ACCESS_LEVEL_OPTIONS = [
  { value: FILTER_ALL, label: 'جميع المستويات' },
  ...EMPLOYEE_ACCESS_LEVELS.map((level) => ({
    value: level,
    label: ACCESS_LEVEL_LABELS[level],
  })),
];

export const DEPARTMENT_OPTIONS = [
  { value: FILTER_ALL, label: 'جميع الأقسام' },
  { value: 'CALL_CENTER', label: 'خدمة العملاء' },
  { value: 'PACKAGING', label: 'التغليف' },
  { value: 'SHIPPING', label: 'الشحن' },
];

export const PERFORMANCE_OPTIONS = [
  { value: FILTER_ALL, label: 'جميع المستويات' },
  { value: 'HIGH', label: 'أداء عالي' },
  { value: 'LOW', label: 'أداء منخفض' },
];

// Defaults to ALL: inactive employees must stay visible or they could never be
// reactivated.
export const ACTIVATION_OPTIONS = [
  { value: FILTER_ALL, label: 'الحسابات النشطة وغير النشطة' },
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'INACTIVE', label: 'غير نشط' },
];
