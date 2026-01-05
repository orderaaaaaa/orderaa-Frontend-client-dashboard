import { CartIcon } from '@/components/icons';
import {
  LiaBoxesSolid,
  LiaWalletSolid,
  LiaTruckSolid,
  LiaIdCard,
} from 'react-icons/lia';
import type { ComponentType } from 'react';
import {
  LuHousePlus,
  LuHouse,
  LuLink2,
  LuFolderPlus,
  LuListPlus,
  LuUsers,
  LuChartNoAxesCombined,
  LuPackage,
} from 'react-icons/lu';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';

export type NavigationItem = {
  name: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  children?: NavigationItem[];
};

export const navigation: NavigationItem[] = [
  { name: ' الرئيسية', href: '/dashboard', icon: LuHouse },
  {
    name: 'الطلبات',
    href: '/dashboard/orders',
    icon: LuPackage,
    children: [
      {
        name: 'جميع الطلبات',
        href: '/dashboard/orders/allOrders',
        icon: CartIcon, // Use your custom icon
      },
    ],
  },
  {
    name: 'التقارير',
    href: '/dashboard/reports',
    icon: LuChartNoAxesCombined,
  },
  {
    name: 'العملاء',
    href: '/dashboard/customers',
    icon: LuUsers,
  },
  {
    name: 'الموظفين',
    href: '/dashboard/employees',
    icon: LiaIdCard,
  },
  // {
  //   name: 'قسم الشحن',
  //   href: '/dashboard/analytics',
  //   icon: Truck,
  //   children: [
  //     {
  //       name: 'تقارير',
  //       href: '/dashboard/analytics/new',
  //       // No icon - now optional
  //     },
  //     {
  //       name: 'موظفين الشحن',
  //       href: '/dashboard/analytics/completed',
  //       // No icon - now optional
  //     },
  //   ],
  // },
  // {
  //   name: 'قسم التجهيز',
  //   href: '/dashboard',
  //   icon: PenBox,
  //   children: [
  //     {
  //       name: 'تقارير',
  //       href: '/dashboard/settings/pending',
  //       // No icon - now optional
  //     },
  //     {
  //       name: 'موظفين الشحن',
  //       href: '/dashboard/settings/done',
  //       // No icon - now optional
  //     },
  //   ],
  // },
  {
    name: 'إضافه طلب جديد',
    href: '/dashboard',
    icon: LuListPlus,
    children: [
      {
        name: 'إضافة طلب يدوي',
        href: '/dashboard/upload-products/manual',
        icon: LuFolderPlus,
      },
      {
        name: 'إضافة طلب Excel',
        href: '/dashboard/upload-products/excel',
        icon: PiMicrosoftExcelLogoFill,
      },
      // {
      //   name: 'اضافة طلب Ai',
      //   href: '/dashboard/upload-products/api',
      //   icon: ListPlus,
      // },
    ],
  },
  {
    name: 'الربط مع متجر خارجي',
    href: '/dashboard/integrations',
    icon: LuLink2,
  },
  {
    name: 'الربط مع شركة الشحن',
    href: '/dashboard/link-shipping-company',
    icon: LiaTruckSolid,
  },
  {
    name: 'اعدادات المتجر',
    href: '/dashboard/store-settings',
    icon: LuHousePlus,
  },
  {
    name: 'المحفظة',
    href: '/dashboard/wallet',
    icon: LiaWalletSolid,
  },
  {
    name: 'المحفظة',
    href: '/dashboard/products',
    icon: LiaBoxesSolid,
  },
];
