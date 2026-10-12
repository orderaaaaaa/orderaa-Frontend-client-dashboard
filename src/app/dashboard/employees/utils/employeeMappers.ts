import { ACCESS_LEVEL_LABELS, isEmployeeAccessLevel } from '../constants/accessLevels';

export const getAccessLevelLabel = (accessLevel: string): string =>
  isEmployeeAccessLevel(accessLevel) ? ACCESS_LEVEL_LABELS[accessLevel] : accessLevel;

export const getActivationLabel = (isActive: boolean): string =>
  isActive ? 'نشط' : 'غير نشط';

export const getDepartmentLabel = (department: string): string => {
  const labels: Record<string, string> = {
    CALL_CENTER: 'خدمة العملاء',
    PACKAGING: 'التغليف',
    SHIPPING: 'الشحن',
  };

  return labels[department] || department;
};
