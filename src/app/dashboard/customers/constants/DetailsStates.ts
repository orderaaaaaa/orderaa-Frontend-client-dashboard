import { StatsTabProps } from '../types/CustomersDetailsModal';

export const buildStatCards = ({
  deliveryRate,
  cancellationRate,
  returnRate,
  delivered,
  cancelled,
  returned,
}: StatsTabProps) => [
  {
    title: 'نسبة المرتجعات',
    rate: returnRate,
    label: 'طلبات مرتجعة',
    count: returned,
  },
  {
    title: 'نسبة الإلغاء',
    rate: cancellationRate,
    label: 'طلبات ملغية',
    count: cancelled,
  },
  {
    title: 'معدل التسليم',
    rate: deliveryRate,
    label: 'تم التسليم',
    count: delivered,
  },
];
