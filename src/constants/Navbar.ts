import {
  House,
  Package,
  Users,
  Truck,
  PenBox,
  ListPlus,
  LucideProps,
  FolderPlus,
  File,
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type NavigationItem = {
  name: string;
  href: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;
  children?: NavigationItem[];
};

export const navigation: NavigationItem[] = [
  { name: ' الرئيسية', href: '/dashboard', icon: House },
  {
    name: ' الطلبات ',
    href: '/dashboard/orders',
    icon: Package,
    children: [{ name: 'جميع الطلبات', href: '/dashboard/orders/allOrders' }],
  },
  {
    name: 'قسم خدمة العملاء',
    href: '/dashboard/customers',
    icon: Users,
    children: [
      { name: 'متابعة الطلبات', href: '/dashboard/customers/complaints' },
    ],
  },
  {
    name: 'قسم الشحن',
    href: '/dashboard/analytics',
    icon: Truck,
    children: [
      { name: 'تقارير ', href: '/dashboard/analytics/new' },
      { name: ' موظفين الشحن', href: '/dashboard/analytics/completed' },
    ],
  },
  {
    name: 'قسم التجهيز',
    href: '/dashboard',
    icon: PenBox,
    children: [
      { name: ' تقارير', href: '/dashboard/settings/pending' },
      { name: ' موظفين الشحن', href: '/dashboard/settings/done' },
    ],
  },
  {
    name: 'إضافه طلب جديد',
    href: '/dashboard',
    icon: ListPlus,
    children: [
      {
        name: 'إضافة طلب يدوي',
        href: '/dashboard/upload-products/manual', // ✅ Fixed: Added leading /
        icon: FolderPlus,
      },
      {
        name: 'إضافة طلب ايكسيل',
        href: '/dashboard/upload-products/excel', // ✅ Fixed: Added leading /
        icon: File,
      },
      {
        name: 'اضافة طلب Ai',
        href: '/dashboard/upload-products/api', // ✅ Fixed: Added leading /
        icon: ListPlus,
      },
    ],
  },
];
