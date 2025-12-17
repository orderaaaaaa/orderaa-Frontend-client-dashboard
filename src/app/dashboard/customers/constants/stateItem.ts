export interface StatItem {
  iconSrc: string;
  label: string;
  value: string;
  subtitle?: string;
  iconColor: string;
  iconBgColor: string;
}

export const statsData: StatItem[] = [
  {
    iconSrc: '/icons/ghost.svg',
    label: 'عميل شبح',
    value: '8',
    iconColor: 'text-blue-600',
    iconBgColor: 'bg-blue-50',
  },
  {
    iconSrc: '/icons/wholesale.svg',
    label: 'مشتري بالجملة',
    value: '12',
    iconColor: 'text-green-600',
    iconBgColor: 'bg-green-50',
  },
  {
    iconSrc: '/icons/premium.svg',
    label: 'عملاء مميزين',
    value: '15',
    iconColor: 'text-purple-600',
    iconBgColor: 'bg-purple-50',
  },
  {
    iconSrc: '/icons/orders.svg',
    label: 'إحصائي الطلبات',
    value: '208',
    subtitle: 'طلب لكل عميل 13.9',
    iconColor: 'text-orange-600',
    iconBgColor: 'bg-orange-50',
  },
  {
    iconSrc: '/icons/customers.svg',
    label: 'إحصائي العملاء',
    value: '15',
    iconColor: 'text-indigo-600',
    iconBgColor: 'bg-indigo-50',
  },
  {
    iconSrc: '/icons/no-response.svg',
    label: 'لا يرد',
    value: '15',
    iconColor: 'text-red-600',
    iconBgColor: 'bg-red-50',
  },
  {
    iconSrc: '/icons/high-value.svg',
    label: 'قيمة عالية',
    value: '208',
    iconColor: 'text-yellow-600',
    iconBgColor: 'bg-yellow-50',
  },
  {
    iconSrc: '/icons/online-viewer.svg',
    label: 'متفرج على الانترنت',
    value: '15',
    iconColor: 'text-cyan-600',
    iconBgColor: 'bg-cyan-50',
  },
];
