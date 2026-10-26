import {
  Ban,
  Banknote,
  Boxes,
  CheckCheck,
  PackageCheck,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tags,
  Truck,
  TrendingDown,
  TrendingUp,
  Undo2,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { KpiAccent, KpiChipTone } from '@/components/ui/kpi-card';
import type {
  SalesDerivedKind,
  SalesMetrics,
  SalesOrderSet,
  SalesSubPageSet,
} from '../types';

export type SalesCardField =
  | 'totalOrders'
  | 'runningOrders'
  | 'deliveredOrders'
  | 'collectedOrders'
  | 'cancelledOrders'
  | 'returnedOrders'
  | 'suppliedAmount'
  | 'averageOrderPrice'
  | 'piecesSold'
  | 'soldPiecesCost'
  | 'purchasesTotal'
  | 'returnsExpense'
  | 'expenses'
  | 'netProfit';

export type SalesTrendMode = 'standard' | 'neutral' | 'amberOnUp';

export interface SalesCardDefinition {
  field: SalesCardField;
  kind: 'count' | 'money';
  label: string;
  hint: string;
  accent: KpiAccent;
  icon: LucideIcon;
  trend: SalesTrendMode;
  link?: SalesSubPageSet;
  placeholder?: boolean;
}

export const SALES_CARDS: SalesCardDefinition[] = [
  {
    field: 'totalOrders',
    kind: 'count',
    label: 'إجمالي الطلبات',
    hint: 'كل الحالات',
    accent: 'primary',
    icon: ShoppingCart,
    trend: 'standard',
    link: 'TOTAL',
  },
  {
    field: 'runningOrders',
    kind: 'count',
    label: 'جاري تشغيل',
    hint: 'قيد التنفيذ، بدون الملغاة والموقوفة',
    accent: 'chart3',
    icon: Truck,
    trend: 'neutral',
    link: 'RUNNING',
  },
  {
    field: 'deliveredOrders',
    kind: 'count',
    label: 'تم التسليم',
    hint: 'حالة تم التسليم',
    accent: 'chart2',
    icon: CheckCheck,
    trend: 'standard',
    link: 'DELIVERED',
  },
  {
    field: 'collectedOrders',
    kind: 'count',
    label: 'الطلبات المحصلة',
    hint: 'حالة تم التحصيل',
    accent: 'chart2',
    icon: PackageCheck,
    trend: 'standard',
    link: 'COLLECTED',
  },
  {
    field: 'cancelledOrders',
    kind: 'count',
    label: 'تم الالغاء',
    hint: 'حالة تم الالغاء',
    accent: 'chart4',
    icon: Ban,
    trend: 'amberOnUp',
    link: 'CANCELLED',
  },
  {
    field: 'returnedOrders',
    kind: 'count',
    label: 'المرتجعات',
    hint: 'كل حالات المرتجع',
    accent: 'chart5',
    icon: Undo2,
    trend: 'amberOnUp',
    link: 'RETURNS',
  },
  {
    field: 'suppliedAmount',
    kind: 'money',
    label: 'إجمالي المبلغ المورد',
    hint: 'للطلبات المحصلة',
    accent: 'chart3',
    icon: Banknote,
    trend: 'standard',
  },
  {
    field: 'averageOrderPrice',
    kind: 'money',
    label: 'متوسط سعر الطلب',
    hint: 'للطلبات المحصلة',
    accent: 'chart4',
    icon: Receipt,
    trend: 'standard',
  },
  {
    field: 'piecesSold',
    kind: 'count',
    label: 'القطع المباعة',
    hint: 'في الطلبات المحصلة',
    accent: 'chart5',
    icon: Boxes,
    trend: 'standard',
    link: 'PIECES_SOLD',
  },
  {
    field: 'soldPiecesCost',
    kind: 'money',
    label: 'تكلفة القطع المباعة',
    hint: 'متوسط سعر الشراء × القطع',
    accent: 'chart1',
    icon: Tags,
    trend: 'neutral',
    link: 'PIECES_COST',
  },
  {
    field: 'purchasesTotal',
    kind: 'money',
    label: 'إجمالي المشتريات',
    hint: 'فواتير المشتريات، كل المتاجر',
    accent: 'primary',
    icon: ShoppingBag,
    trend: 'neutral',
  },
  {
    field: 'returnsExpense',
    kind: 'money',
    label: 'مصاريف المرتجعات',
    hint: 'المرتجعات بالصافي؛ القيمة الموجبة تعني تكلفة',
    accent: 'chart4',
    icon: TrendingDown,
    trend: 'amberOnUp',
    link: 'RETURNS_EXPENSES',
  },
  {
    field: 'expenses',
    kind: 'money',
    label: 'المصروفات',
    hint: 'قريباً',
    accent: 'chart1',
    icon: Wallet,
    trend: 'neutral',
    placeholder: true,
  },
  {
    field: 'netProfit',
    kind: 'money',
    label: 'صافي الربح',
    hint: 'المبيعات − تكلفة القطع − مصاريف المرتجعات − المصروفات',
    accent: 'chart2',
    icon: TrendingUp,
    trend: 'standard',
  },
];

export const SALES_COPY = {
  pageTitle: 'إحصائيات المبيعات',
  subtitle: 'حسب تاريخ إنشاء الطلب، بتوقيت القاهرة',
  storePlaceholder: 'المتاجر',
  carrierPlaceholder: 'شركات الشحن',
  pagePlaceholder: 'الصفحات',
  filterOptionsErrorMessage: 'تعذر تحميل الخيارات',
  approvedOnlyLabel: 'الفواتير المستلمة فقط',
  clearAll: 'مسح الكل',
  breakdownTitle: 'التفصيل حسب النطاق',
  breakdownColumns: [
    'النطاق',
    'الطلبات',
    'المحصلة',
    'المبلغ المورد',
    'القطع',
    'تكلفة القطع',
    'متوسط الطلب',
    'مصاريف المرتجعات',
    'المصروفات',
    'صافي الربح',
  ],
  totalsRowLabel: 'الإجمالي',
  sectionLabels: {
    statuses: 'حالات الطلبات',
    sales: 'المبيعات',
    costAndProfit: 'التكلفة والربح',
  },
  emptyStateTitle: 'لا توجد طلبات في هذه الفترة',
  emptyStateSubtitle: 'جرّب تغيير الفترة أو النطاق',
  errorStateTitle: 'تعذر تحميل الإحصائيات',
  errorStateRetry: 'إعادة المحاولة',
  noAccessTitle: 'ليس لديك صلاحية لعرض إحصائيات المبيعات',
  trendTooltipPrefix: 'مقارنة بالفترة السابقة',
  backToStatistics: 'العودة إلى إحصائيات المبيعات',
  includesDerivedNote: 'يشمل طلبات مشتقة',
  exportLabel: 'تصدير Excel',
  ordersCountLabel: 'عدد الطلبات',
  amountLabel: 'إجمالي المبلغ',
  piecesCountLabel: 'عدد القطع',
  comingSoon: 'قريباً',
  subPageEmptyTitle: 'لا توجد نتائج لهذا الفلتر',
  subPageEmptySubtitle: 'جرّب تغيير الفترة أو النطاق',
  subPageErrorTitle: 'تعذر تحميل القائمة',
  exportErrorMessage: 'تعذر تصدير الملف',
} as const;

export const BREAKDOWN_GROUP_HEADINGS: Record<'STORE' | 'CARRIER' | 'PAGE', string> = {
  STORE: 'المتاجر',
  CARRIER: 'شركات الشحن',
  PAGE: 'الصفحات',
};

export type SalesOrderColumn =
  | 'code'
  | 'customerName'
  | 'governorate'
  | 'city'
  | 'totalCost'
  | 'carrierName'
  | 'storeOrPage'
  | 'createdAt'
  | 'status'
  | 'legCode'
  | 'shippingCode'
  | 'settlementAmount'
  | 'amount'
  | 'shippingCost'
  | 'settlementCode'
  | 'settlementRecordedAt'
  | 'cancelReason'
  | 'cancelNotes';

export const SALES_ORDER_COLUMN_LABELS: Record<SalesOrderColumn, string> = {
  code: 'كود الطلب',
  customerName: 'العميل',
  governorate: 'المحافظة',
  city: 'المدينة',
  totalCost: 'إجمالي الطلب',
  carrierName: 'شركة الشحن',
  storeOrPage: 'المتجر/الصفحة',
  createdAt: 'تاريخ الإنشاء',
  status: 'الحالة',
  legCode: 'كود الفرع R',
  shippingCode: 'كود الشحن',
  settlementAmount: 'المبلغ المورد',
  amount: 'المبلغ',
  shippingCost: 'تكلفة الشحن',
  settlementCode: 'كود التحصيل',
  settlementRecordedAt: 'تاريخ التحصيل',
  cancelReason: 'سبب الإلغاء',
  cancelNotes: 'ملاحظات الإلغاء',
};

export const SALES_DERIVED_KIND_LABELS: Record<SalesDerivedKind, string> = {
  PARTIAL_REMAINDER: 'متبقي جزئي',
  REPLACEMENT: 'بديل',
  EXCHANGE_RETURN: 'تبادل مرتجع',
};

const COMMON_ORDER_COLUMNS: readonly SalesOrderColumn[] = [
  'code',
  'customerName',
  'governorate',
  'city',
  'totalCost',
  'carrierName',
  'storeOrPage',
  'createdAt',
];

export interface SalesSubPageDefinition {
  title: string;
  includesDerived: boolean;
  columns: readonly SalesOrderColumn[];
  withCost: boolean;
}

export const SALES_ORDER_SETS: readonly SalesOrderSet[] = [
  'TOTAL',
  'RUNNING',
  'DELIVERED',
  'COLLECTED',
  'CANCELLED',
  'RETURNS',
  'RETURNS_EXPENSES',
];

export const SALES_SUBPAGE_SETS: Record<SalesSubPageSet, SalesSubPageDefinition> = {
  TOTAL: {
    title: 'إجمالي الطلبات',
    includesDerived: false,
    columns: [...COMMON_ORDER_COLUMNS, 'status'],
    withCost: false,
  },
  RUNNING: {
    title: 'جاري تشغيل',
    includesDerived: true,
    columns: [...COMMON_ORDER_COLUMNS, 'status', 'legCode'],
    withCost: false,
  },
  DELIVERED: {
    title: 'تم التسليم',
    includesDerived: false,
    columns: [...COMMON_ORDER_COLUMNS, 'shippingCode'],
    withCost: false,
  },
  COLLECTED: {
    title: 'الطلبات المحصلة',
    includesDerived: false,
    columns: [
      ...COMMON_ORDER_COLUMNS,
      'settlementAmount',
      'settlementCode',
      'shippingCode',
      'settlementRecordedAt',
    ],
    withCost: false,
  },
  CANCELLED: {
    title: 'تم الالغاء',
    includesDerived: false,
    columns: [...COMMON_ORDER_COLUMNS, 'cancelReason', 'cancelNotes'],
    withCost: false,
  },
  RETURNS: {
    title: 'المرتجعات',
    includesDerived: true,
    columns: [
      ...COMMON_ORDER_COLUMNS,
      'status',
      'settlementAmount',
      'shippingCode',
      'legCode',
    ],
    withCost: false,
  },
  RETURNS_EXPENSES: {
    title: 'مصاريف المرتجعات',
    includesDerived: true,
    columns: [
      ...COMMON_ORDER_COLUMNS,
      'shippingCode',
      'legCode',
      'amount',
      'shippingCost',
      'settlementCode',
      'settlementRecordedAt',
    ],
    withCost: false,
  },
  PIECES_SOLD: {
    title: 'القطع المباعة',
    includesDerived: false,
    columns: [],
    withCost: false,
  },
  PIECES_COST: {
    title: 'تكلفة القطع المباعة',
    includesDerived: false,
    columns: [],
    withCost: true,
  },
};

export function isSalesSubPageSet(value: string): value is SalesSubPageSet {
  return Object.prototype.hasOwnProperty.call(SALES_SUBPAGE_SETS, value);
}

export function isSalesOrderSet(set: SalesSubPageSet): set is SalesOrderSet {
  return (SALES_ORDER_SETS as readonly string[]).includes(set);
}

export function resolveCardContextChip(
  field: SalesCardField,
  totals: SalesMetrics,
  approvedOnly: boolean,
): { tone: KpiChipTone; text: string } | undefined {
  if (field === 'collectedOrders') {
    if (totals.totalOrders === 0) return undefined;
    const percent = Math.round((totals.collectedOrders / totals.totalOrders) * 100);
    return { tone: 'neutral', text: `${percent}% من الطلبات` };
  }
  if (field === 'suppliedAmount') {
    if (totals.collectedWithoutSettlement <= 0) return undefined;
    return { tone: 'warning', text: `${totals.collectedWithoutSettlement} طلبات بدون مبلغ مورد` };
  }
  if (field === 'soldPiecesCost') {
    if (totals.uncostedPieces <= 0) return undefined;
    return { tone: 'warning', text: `${totals.uncostedPieces} قطعة بدون تكلفة` };
  }
  if (field === 'purchasesTotal') {
    if (!approvedOnly) return undefined;
    return { tone: 'neutral', text: 'المستلمة فقط' };
  }
  if (field === 'returnsExpense') {
    if (totals.returnsWithoutSettlement <= 0) return undefined;
    return { tone: 'warning', text: `${totals.returnsWithoutSettlement} طلبات بدون مبلغ` };
  }
  return undefined;
}

function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export function formatTrendTooltip(previousRange: { from: string; to: string }): string {
  return `${SALES_COPY.trendTooltipPrefix} (${formatDayMonth(previousRange.from)} – ${formatDayMonth(previousRange.to)})`;
}

export function formatTrendAriaLabel(direction: 'up' | 'down' | 'flat', percent: number): string {
  if (direction === 'up') return `زيادة ${percent}% مقارنة بالفترة السابقة`;
  if (direction === 'down') return `انخفاض ${percent}% مقارنة بالفترة السابقة`;
  return 'بدون تغيير مقارنة بالفترة السابقة';
}

export function resolveTrendTone(
  mode: SalesTrendMode,
  direction: 'up' | 'down' | 'flat',
): KpiChipTone {
  if (mode === 'neutral' || direction === 'flat') return 'neutral';
  if (mode === 'amberOnUp') return direction === 'up' ? 'warning' : 'neutral';
  return direction === 'up' ? 'success' : 'warning';
}

export type SalesViewState = 'no-access' | 'first-load' | 'error' | 'refetch' | 'ready';

export interface ResolveSalesViewStateInput {
  hasPermission: boolean;
  isLoading: boolean;
  isFetching: boolean;
  data: unknown;
  error: { status: number } | null;
}

export function resolveSalesViewState(input: ResolveSalesViewStateInput): SalesViewState {
  if (!input.hasPermission) return 'no-access';
  if (input.error) return input.error.status === 403 ? 'no-access' : 'error';
  if (!input.data) return 'first-load';
  if (input.isFetching) return 'refetch';
  return 'ready';
}
