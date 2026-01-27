import type { OrderStatusDistributionItem } from '../types';

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
