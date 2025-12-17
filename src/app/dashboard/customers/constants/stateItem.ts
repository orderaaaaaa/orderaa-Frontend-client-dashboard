import {
  Users,
  ShoppingBag,
  Award,
  Receipt,
  Phone,
  DollarSign,
  Eye,
  LucideIcon,
} from 'lucide-react';

interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
}

export const statsData: StatItem[] = [
  {
    icon: Users,
    label: 'إجمالي العملاء',
    value: '15',
  },
  {
    icon: Receipt,
    label: 'إجمالي الطلبات',
    value: '208',
    subtitle: '13.9 طلب لكل عميل',
  },
  {
    icon: Award,
    label: 'عملاء مميزين',
    value: '15',
  },
  {
    icon: ShoppingBag,
    label: 'مشتري بالجملة',
    value: '12',
  },
  {
    icon: Users,
    label: 'عميل شبح',
    value: '8',
  },
  {
    icon: Eye,
    label: 'متفرج على الانترنت',
    value: '15',
  },
  {
    icon: DollarSign,
    label: 'قيمة عالية',
    value: '208',
  },
  {
    icon: Phone,
    label: 'لا يرد',
    value: '15',
  },
];
