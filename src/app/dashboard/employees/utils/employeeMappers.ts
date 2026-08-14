export const getAccessLevelLabel = (accessLevel: string): string => {
  const labels: Record<string, string> = {
    SUPER_ADMIN: 'سوبر أدمن',
    ADMIN: 'أدمن',
    MANAGER: 'مدير',
    EMPLOYEE: 'موظف',
  };

  return labels[accessLevel] || accessLevel;
};

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
