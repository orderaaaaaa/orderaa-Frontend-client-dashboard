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
  LiaHeadsetSolid,
  LiaFileInvoiceDollarSolid,
  LiaReceiptSolid,
  LiaPlusSolid,
  LiaUsersSolid,
  LiaWarehouseSolid,
  LiaClipboardListSolid,
  LiaCubesSolid,
  LiaUndoAltSolid,
  LiaRobotSolid,
  LiaUserShieldSolid,
  LiaTruckMovingSolid,
  LiaHandHoldingUsdSolid,
  LiaHourglassEndSolid,
  LiaFileInvoiceSolid,
  LiaTruckLoadingSolid,
  LiaTagsSolid,
  LiaBoxesSolid,
  LiaUserPlusSolid,
  LiaIndustrySolid,
  LiaSearchSolid,
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
  Upload,
  FileOutput,
  TrendingUp,
  SpellCheck,
  Tag,
  Tags,
  Map,
  MapPin,
} from 'lucide-react';
import { IconType } from 'react-icons';
import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { PERMISSION_CODES, type PermissionCode } from '@/lib/permissions';
import { WAREHOUSES_PAGE_ENABLED } from '@/constants/warehouses';

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
  /**
   * ABAC permission code required to see this entry (e.g. `roles:read`).
   * Omit for entries every authenticated user may reach. The Sidebar drops
   * hidden entries — and any parent left without visible children.
   */
  permission?: PermissionCode;
};

export const navigation: NavigationItem[] = [
  { name: ' الرئيسية', href: '/dashboard', icon: House },
  {
    name: 'الإحصائيات',
    href: '/dashboard/statistics',
    icon: ChartNoAxesCombined,
    children: [
      {
        name: 'إحصائيات المبيعات',
        href: '/dashboard/statistics/sales',
        icon: TrendingUp,
        permission: PERMISSION_CODES.REPORTS_SALES_READ,
      },
    ],
  },
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
        name: 'قسم الكول سنتر',
        href: '/dashboard/orders/call-center',
        icon: LiaHeadsetSolid,
      },
      {
        name: 'قسم التغليف',
        href: '/dashboard/orders/print-orders',
        icon: LiaBoxOpenSolid,
      },
      {
        name: 'قسم الشحن',
        href: '/dashboard/orders/shipping-orders',
        icon: LiaShippingFastSolid,
      },
      {
        name: 'متابعة الشحن',
        href: '/dashboard/orders/tracking',
        icon: LiaClipboardCheckSolid,
      },
      {
        name: 'الطلبات المتأخرة',
        href: '/dashboard/orders/delayed',
        icon: LiaHourglassEndSolid,
      },
      {
        name: 'قائمة المفقودات',
        href: '/dashboard/orders/missing',
        icon: LiaSearchSolid,
        permission: PERMISSION_CODES.ORDERS_MISSING_READ,
      },
    ],
  },
  {
    name: 'المرتجعات',
    href: '/dashboard/orders/returns-receiving',
    icon: LiaUndoAltSolid,
    children: [
      {
        name: 'استلامات المرتجعات',
        href: '/dashboard/orders/returns-receiving',
        icon: LiaUndoAltSolid,
      },
      {
        name: 'إيصالات المرتجعات',
        href: '/dashboard/orders/returns-receiving/receipts',
        icon: LiaFileInvoiceSolid,
      },
    ],
  },
  // {
  //   name: 'التقارير',
  //   href: '/dashboard/reports',
  //   icon: ChartNoAxesCombined,
  // },
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
    name: 'الأدوار والصلاحيات',
    href: '/dashboard/settings/roles',
    icon: LiaUserShieldSolid,
    permission: PERMISSION_CODES.ROLES_READ,
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
    name: 'مناديب الشحن وشركات الشحن',
    href: '/dashboard/shipping-providers',
    icon: LiaTruckMovingSolid,
  },
  {
    name: 'التحصيلات',
    href: '/dashboard/orders/settlement',
    icon: LiaHandHoldingUsdSolid,
    children: [
      {
        name: 'رفع شيت التحصيل',
        href: '/dashboard/orders/settlement/upload',
        icon: Upload,
        permission: PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE,
      },
      {
        name: 'جميع التحصيلات',
        href: '/dashboard/orders/settlement/collections',
        icon: LiaHandHoldingUsdSolid,
        permission: PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE,
      },
      {
        name: 'تحصيل ناقص',
        href: '/dashboard/orders/settlement/shortfall',
        icon: FileOutput,
        permission: PERMISSION_CODES.ORDERS_SETTLEMENT_MANAGE,
      },
    ],
  },
  {
    name: 'بيك اب',
    href: '/dashboard/orders/pickups',
    icon: LiaTruckLoadingSolid,
  },
  {
    name: 'الربط مع شركات التاكيد الالي',
    href: '/dashboard/link-auto-confirmation',
    icon: LiaRobotSolid,
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
    icon: LiaTagsSolid,
  },
  {
    name: 'التسميات الموحدة',
    href: '/dashboard/canonical-names',
    icon: SpellCheck,
    children: [
      {
        name: 'أسماء الخصائص',
        href: '/dashboard/canonical-names/attribute-names',
        icon: Tag,
        permission: PERMISSION_CODES.CANONICAL_NAMES_READ,
      },
      {
        name: 'قيم الخصائص',
        href: '/dashboard/canonical-names/attribute-options',
        icon: Tags,
        permission: PERMISSION_CODES.CANONICAL_NAMES_READ,
      },
      {
        name: 'المحافظات',
        href: '/dashboard/canonical-names/governorates',
        icon: Map,
        permission: PERMISSION_CODES.CANONICAL_NAMES_READ,
      },
      {
        name: 'المدن',
        href: '/dashboard/canonical-names/cities',
        icon: MapPin,
        permission: PERMISSION_CODES.CANONICAL_NAMES_READ,
      },
    ],
  },
  {
    name: 'مشتريات',
    href: '/dashboard/purchases',
    icon: LiaFileInvoiceDollarSolid,
    children: [
      {
        name: 'اضافة فاتورة',
        href: '/dashboard/purchases/add-invoice',
        icon: LiaPlusSolid,
      },
      {
        name: 'جميع الفواتير',
        href: '/dashboard/purchases/all-invoices',
        icon: LiaReceiptSolid,
      },
    ],
  },
  {
    name: 'الموردين',
    href: '/dashboard/purchases/all-suppliers',
    icon: LiaIndustrySolid,
    children: [
      {
        name: 'جميع الموردين',
        href: '/dashboard/purchases/all-suppliers',
        icon: LiaUsersSolid,
      },
      {
        name: 'اضافة مورد',
        href: '/dashboard/purchases/add-supplier',
        icon: LiaUserPlusSolid,
      },
    ],
  },
  {
    name: 'المخزون',
    href: '/dashboard/inventory',
    icon: LiaBoxesSolid,
    children: [
      ...(WAREHOUSES_PAGE_ENABLED
        ? [
          {
            name: 'إدارة المخازن',
            href: '/dashboard/inventory/warehouses',
            icon: LiaWarehouseSolid,
          },
        ]
        : []),
      {
        name: 'ادارة المخزن',
        href: '/dashboard/inventory/stock-management',
        icon: LiaCubesSolid,
      },
      {
        name: 'إدارة الاستلامات',
        href: '/dashboard/inventory/receipts',
        icon: LiaClipboardListSolid,
      },
    ],
  },
  // {
  //   name: 'المتاجر',
  //   href: '/dashboard/stores',
  //   icon: LiaStoreSolid,
  // },
  // {
  //   name: 'العملاء و الليدز',
  //   href: '/dashboard/leads',
  //   icon: LiaUsersCogSolid,
  // },
];
