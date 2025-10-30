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
  Link2,
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { CartIcon, ExcelIcon } from '@/components/icons'; // Import from your icons registry

export type NavigationItem = {
  name: string;
  href: string;
  icon?:
  | ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
  | ((props: { className?: string }) => JSX.Element);
  children?: NavigationItem[];
};

export const navigation: NavigationItem[] = [
  { name: ' الرئيسية', href: '/dashboard', icon: House },
  {
    name: 'الطلبات',
    href: '/dashboard/orders',
    icon: Package,
    children: [
      {
        name: 'جميع الطلبات',
        href: '/dashboard/orders/allOrders',
        icon: CartIcon, // Use your custom icon
      },
    ],
  },
  {
    name: 'قسم خدمة العملاء',
    href: '/dashboard/customers',
    icon: Users,
    children: [
      {
        name: 'تقارير خدمع العملاء',
        href: '/dashboard/customers/customer-service',
      },
      {
        name: 'متابعة الطلبات',
        href: '/dashboard/customers/complaints',
      },
    ],
  },
  {
    name: 'قسم الشحن',
    href: '/dashboard/analytics',
    icon: Truck,
    children: [
      {
        name: 'تقارير',
        href: '/dashboard/analytics/new',
        // No icon - now optional
      },
      {
        name: 'موظفين الشحن',
        href: '/dashboard/analytics/completed',
        // No icon - now optional
      },
    ],
  },
  {
    name: 'قسم التجهيز',
    href: '/dashboard',
    icon: PenBox,
    children: [
      {
        name: 'تقارير',
        href: '/dashboard/settings/pending',
        // No icon - now optional
      },
      {
        name: 'موظفين الشحن',
        href: '/dashboard/settings/done',
        // No icon - now optional
      },
    ],
  },
  {
    name: 'إضافه طلب جديد',
    href: '/dashboard',
    icon: ListPlus,
    children: [
      {
        name: 'إضافة طلب يدوي',
        href: '/dashboard/upload-products/manual',
        icon: FolderPlus,
      },
      {
        name: 'إضافة طلب Excel',
        href: '/dashboard/upload-products/excel',
        icon: ExcelIcon,
      },
      {
        name: 'اضافة طلب Ai',
        href: '/dashboard/upload-products/api',
        icon: ListPlus,
      },
    ],
  },
  {
    name: 'الربط مع متجر خارجي',
    href: '/dashboard/integrations',
    icon: Link2,
  },
];
