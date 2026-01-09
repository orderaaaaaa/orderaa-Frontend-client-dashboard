export const LEAD_STATUS_CONFIG = {
  active: {
    label: 'نشط',
    bgColor: 'bg-[#e8f5e9]',
    textColor: 'text-[#2e7d32]',
    borderColor: 'border-[#2e7d32]',
  },
  oneDayRemaining: {
    label: 'يوم واحد متبقي',
    bgColor: 'bg-[#fff3e0]',
    textColor: 'text-[#e65100]',
    borderColor: 'border-[#e65100]',
  },
  threeDaysRemaining: {
    label: '٣ أيام متبقية',
    bgColor: 'bg-[#fff8e1]',
    textColor: 'text-[#f57c00]',
    borderColor: 'border-[#f57c00]',
  },
  noActivity: {
    label: 'لا يوجد نشاط',
    bgColor: 'bg-[#f5f5f5]',
    textColor: 'text-[#757575]',
    borderColor: 'border-[#757575]',
  },
} as const;

export type LeadStatusType = keyof typeof LEAD_STATUS_CONFIG;
