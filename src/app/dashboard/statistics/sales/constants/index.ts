import {
  Banknote,
  Boxes,
  PackageCheck,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Tags,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { KpiAccent, KpiChipTone } from '@/components/ui/kpi-card';
import type { SalesMetrics } from '../types';

export type SalesCardField =
  | 'totalOrders'
  | 'collectedOrders'
  | 'suppliedAmount'
  | 'averageOrderPrice'
  | 'piecesSold'
  | 'soldPiecesCost'
  | 'purchasesTotal'
  | 'grossMargin';

export interface SalesCardDefinition {
  field: SalesCardField;
  kind: 'count' | 'money';
  label: string;
  hint: string;
  accent: KpiAccent;
  icon: LucideIcon;
  neutralTrend: boolean;
}

export const SALES_CARDS: SalesCardDefinition[] = [
  {
    field: 'totalOrders',
    kind: 'count',
    label: 'إجمالي الطلبات',
    hint: 'كل الحالات',
    accent: 'primary',
    icon: ShoppingCart,
    neutralTrend: false,
  },
  {
    field: 'collectedOrders',
    kind: 'count',
    label: 'الطلبات المحصلة',
    hint: 'حالة تم التحصيل',
    accent: 'chart2',
    icon: PackageCheck,
    neutralTrend: false,
  },
  {
    field: 'suppliedAmount',
    kind: 'money',
    label: 'إجمالي المبلغ المورد',
    hint: 'للطلبات المحصلة',
    accent: 'chart3',
    icon: Banknote,
    neutralTrend: false,
  },
  {
    field: 'averageOrderPrice',
    kind: 'money',
    label: 'متوسط سعر الطلب',
    hint: 'للطلبات المحصلة',
    accent: 'chart4',
    icon: Receipt,
    neutralTrend: false,
  },
  {
    field: 'piecesSold',
    kind: 'count',
    label: 'القطع المباعة',
    hint: 'في الطلبات المحصلة',
    accent: 'chart5',
    icon: Boxes,
    neutralTrend: false,
  },
  {
    field: 'soldPiecesCost',
    kind: 'money',
    label: 'تكلفة القطع المباعة',
    hint: 'متوسط سعر الشراء × القطع',
    accent: 'chart1',
    icon: Tags,
    neutralTrend: true,
  },
  {
    field: 'purchasesTotal',
    kind: 'money',
    label: 'إجمالي المشتريات',
    hint: 'فواتير المشتريات، كل المتاجر',
    accent: 'primary',
    icon: ShoppingBag,
    neutralTrend: true,
  },
  {
    field: 'grossMargin',
    kind: 'money',
    label: 'الهامش الإجمالي',
    hint: 'المبلغ المورد − تكلفة القطع المباعة',
    accent: 'chart2',
    icon: TrendingUp,
    neutralTrend: false,
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
    'الهامش',
  ],
  totalsRowLabel: 'الإجمالي',
  sectionLabels: {
    sales: 'المبيعات',
    cost: 'التكلفة والهامش',
  },
  emptyStateTitle: 'لا توجد طلبات في هذه الفترة',
  emptyStateSubtitle: 'جرّب تغيير الفترة أو النطاق',
  errorStateTitle: 'تعذر تحميل الإحصائيات',
  errorStateRetry: 'إعادة المحاولة',
  noAccessTitle: 'ليس لديك صلاحية لعرض إحصائيات المبيعات',
  trendTooltipPrefix: 'مقارنة بالفترة السابقة',
} as const;

export const BREAKDOWN_GROUP_HEADINGS: Record<'STORE' | 'CARRIER' | 'PAGE', string> = {
  STORE: 'المتاجر',
  CARRIER: 'شركات الشحن',
  PAGE: 'الصفحات',
};

export function resolveCardContextChip(
  field: SalesCardField,
  totals: SalesMetrics,
  approvedOnly: boolean,
): { tone: KpiChipTone; text: string } | undefined {
  if (field === 'collectedOrders') {
    if (totals.totalOrders === 0) return undefined;
    const percent = Math.round((totals.collectedOrders / totals.totalOrders) * 100);
    return { tone: 'neutral', text: `${percent}٪ من الطلبات` };
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
  if (direction === 'up') return `زيادة ${percent}٪ مقارنة بالفترة السابقة`;
  if (direction === 'down') return `انخفاض ${percent}٪ مقارنة بالفترة السابقة`;
  return 'بدون تغيير مقارنة بالفترة السابقة';
}

export function resolveTrendTone(
  neutralTrend: boolean,
  direction: 'up' | 'down' | 'flat',
): KpiChipTone {
  if (neutralTrend || direction === 'flat') return 'neutral';
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
