// In leadsListConfig.ts
export const ACTIVITY_STATUS_CONFIG = {
  active: {
    label: 'نشط',
    bgColor: 'bg-green-50',
    textColor: 'text-[#3cc900]',
    borderColor: 'border-[#3cc900]',
  },
  noActivity: {
    label: 'لا يوجد نشاط',
    bgColor: 'bg-muted',
    textColor: 'text-muted-foreground',
    borderColor: 'border-muted-foreground',
  },
} as const;

export const DAYS_STATUS_CONFIG = {
  oneDayRemaining: {
    label: 'يوم واحد متبقي',
    bgColor: 'bg-red-50',
    textColor: 'text-[#ff0004] dark:text-danger-text',
    borderColor: 'border-[#ff0004] dark:border-danger-border',
  },
  threeDaysRemaining: {
    label: '3 أيام متبقية',
    bgColor: 'bg-orange-50',
    textColor: 'text-[#ff9800]',
    borderColor: 'border-[#ff9800]',
  },
} as const;
