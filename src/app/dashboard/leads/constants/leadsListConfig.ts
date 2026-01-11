// In leadsListConfig.ts
export const ACTIVITY_STATUS_CONFIG = {
  active: {
    label: 'نشط',
    bgColor: 'bg-[#f7fdf5]',
    textColor: 'text-[#3cc900]',
    borderColor: 'border-[#3cc900]',
  },
  noActivity: {
    label: 'لا يوجد نشاط',
    bgColor: 'bg-[#f5f5f5]',
    textColor: 'text-[#626262]',
    borderColor: 'border-[#626262]',
  },
} as const;

export const DAYS_STATUS_CONFIG = {
  oneDayRemaining: {
    label: 'يوم واحد متبقي',
    bgColor: 'bg-[#fff5f5]',
    textColor: 'text-[#ff0004]',
    borderColor: 'border-[#ff0004]',
  },
  threeDaysRemaining: {
    label: '٣ أيام متبقية',
    bgColor: 'bg-[#fffbf5]',
    textColor: 'text-[#ff9800]',
    borderColor: 'border-[#ff9800]',
  },
} as const;
