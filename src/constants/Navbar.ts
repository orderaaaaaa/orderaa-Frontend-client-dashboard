import { CartIcon, ExcelIcon } from '@/components/icons';
import {
  LiaBoxOpenSolid,
  LiaWalletSolid,
  LiaTruckSolid,
  LiaIdCard,
  LiaClipboardCheckSolid,
  LiaStoreSolid,
  LiaUsersCogSolid,
  LiaShippingFastSolid,
} from 'react-icons/lia';
import {
  House,
  Package,
  Users,
  ListPlus,
  LucideProps,
  FolderPlus,
  Link2,
  ChartNoAxesCombined,
  HousePlus,
} from 'lucide-react';
import { IconType } from 'react-icons';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export type NavigationItem = {
  name: string;
  href: string;
  icon?:
    | ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
      >
    | ((props: { className?: string }) => JSX.Element)
    | IconType;
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
        icon: CartIcon,
      },
      {
        name: 'قسم التغليف',
        href: '/dashboard/orders/print-orders',
        icon: LiaClipboardCheckSolid,
      },
      {
        name: 'قسم الشحن',
        href: '/dashboard/orders/shipping-orders',
        icon: LiaShippingFastSolid,
      },
      {
        name: 'قسم الكول سنتر',
        href: '/dashboard/orders/call-center',
        icon: LiaShippingFastSolid,
      },
    ],
  },
  {
    name: 'التقارير',
    href: '/dashboard/reports',
    icon: ChartNoAxesCombined,
  },
  {
    name: 'العملاء',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    name: 'الموظفين',
    href: '/dashboard/employees',
    icon: LiaIdCard,
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
    ],
  },
  {
    name: 'الربط مع متجر خارجي',
    href: '/dashboard/integrations',
    icon: Link2,
  },
  {
    name: 'الربط مع شركة الشحن',
    href: '/dashboard/link-shipping-company',
    icon: LiaTruckSolid,
  },
  {
    name: 'اعدادات المتجر',
    href: '/dashboard/store-settings',
    icon: HousePlus,
  },
  {
    name: 'المحفظة',
    href: '/dashboard/wallet',
    icon: LiaWalletSolid,
  },
  {
    name: 'المنتجات',
    href: '/dashboard/products',
    icon: LiaBoxOpenSolid,
  },
  {
    name: 'المتاجر',
    href: '/dashboard/stores',
    icon: LiaStoreSolid,
  },
  {
    name: 'العملاء و الليدز',
    href: '/dashboard/leads',
    icon: LiaUsersCogSolid,
  },
];
