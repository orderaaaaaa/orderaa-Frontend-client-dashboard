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
import { formatCount, formatPercent } from '@/utils/formatMoney';
import type {
  SalesDerivedKind,
  SalesExclusionReason,
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
  | 'netProfit'
  | 'pendingCollectionAmount'
  | 'deliveredProductsCost'
  | 'pendingProfit';

export type SalesTrendMode = 'standard' | 'neutral' | 'amberOnUp' | 'hidden';

export type SalesCardSection = 'statuses' | 'sales' | 'collection' | 'costAndProfit';

export interface SalesCardDefinition {
  field: SalesCardField;
  kind: 'count' | 'money';
  label: string;
  hint: string;
  approvedHint?: string;
  section: SalesCardSection;
  accent: KpiAccent;
  icon: LucideIcon;
  trend: SalesTrendMode;
  link?: SalesSubPageSet;
  placeholder?: boolean;
}

export interface SalesCardChip {
  tone: KpiChipTone;
  text: string;
  note?: string;
  tooltip?: string;
}

export const SALES_CARDS: SalesCardDefinition[] = [
  {
    field: 'totalOrders',
    section: 'statuses',
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
    section: 'statuses',
    kind: 'count',
    label: 'جاري تشغيل',
    hint: 'قيد التنفيذ، بدون الملغاة',
    accent: 'chart3',
    icon: Truck,
    trend: 'neutral',
    link: 'RUNNING',
  },
  {
    field: 'deliveredOrders',
    section: 'statuses',
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
    section: 'statuses',
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
    section: 'statuses',
    kind: 'count',
    label: 'تم الإلغاء',
    hint: 'حالة تم الإلغاء',
    accent: 'chart4',
    icon: Ban,
    trend: 'amberOnUp',
    link: 'CANCELLED',
  },
  {
    field: 'returnedOrders',
    section: 'statuses',
    kind: 'count',
    label: 'المرتجعات',
    hint: 'كل حالات المرتجع',
    accent: 'chart5',
    icon: Undo2,
    trend: 'amberOnUp',
    link: 'RETURNS',
  },
  {
    field: 'pendingCollectionAmount',
    kind: 'money',
    label: 'مبلغ جاري تحصيله',
    hint: 'طلبات مسلّمة لم تُحصّل بعد، بعد رسوم الشحن',
    section: 'collection',
    accent: 'chart3',
    icon: Banknote,
    trend: 'standard',
  },
  {
    field: 'deliveredProductsCost',
    kind: 'money',
    label: 'تكلفة منتجات تم التسليم',
    hint: 'متوسط سعر الشراء × القطع المسلّمة، كل الفواتير غير المحذوفة',
    approvedHint: 'متوسط تكلفة الفواتير المغلقة × القطع المسلّمة',
    section: 'collection',
    accent: 'chart4',
    icon: Tags,
    trend: 'standard',
    link: 'DELIVERED_COST',
  },
  {
    field: 'pendingProfit',
    kind: 'money',
    label: 'أرباح جاري تحصيلها',
    hint: 'المبلغ − رسوم الشحن − تكلفة المنتجات، للطلبات المسلّمة غير المحصلة',
    section: 'collection',
    accent: 'chart2',
    icon: TrendingUp,
    trend: 'standard',
    link: 'PENDING_PROFIT',
  },
  {
    field: 'suppliedAmount',
    section: 'sales',
    kind: 'money',
    label: 'إجمالي المبلغ المورد',
    hint: 'للطلبات المحصلة',
    accent: 'chart3',
    icon: Banknote,
    trend: 'standard',
  },
  {
    field: 'averageOrderPrice',
    section: 'sales',
    kind: 'money',
    label: 'متوسط سعر الطلب',
    hint: 'للطلبات المحصلة',
    accent: 'chart4',
    icon: Receipt,
    trend: 'standard',
  },
  {
    field: 'piecesSold',
    section: 'sales',
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
    section: 'costAndProfit',
    kind: 'money',
    label: 'تكلفة القطع المباعة',
    hint: 'متوسط سعر الشراء لكل متغير (أو متوسط المنتج إن لم يكن للمتغير سعر)، كل الفترات، كل الفواتير غير المحذوفة × قطع الفترة والفلاتر المحددة',
    approvedHint: 'متوسط سعر الشراء لكل متغير (أو متوسط المنتج إن لم يكن للمتغير سعر)، كل الفترات، الفواتير المغلقة × قطع الفترة والفلاتر المحددة',
    accent: 'chart1',
    icon: Tags,
    trend: 'hidden',
    link: 'PIECES_COST',
  },
  {
    field: 'purchasesTotal',
    section: 'costAndProfit',
    kind: 'money',
    label: 'إجمالي المشتريات',
    hint: 'فواتير المشتريات، كل المتاجر',
    accent: 'primary',
    icon: ShoppingBag,
    trend: 'neutral',
  },
  {
    field: 'returnsExpense',
    section: 'costAndProfit',
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
    section: 'costAndProfit',
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
    section: 'costAndProfit',
    kind: 'money',
    label: 'صافي الربح',
    hint: 'المبلغ المورد − تكلفة القطع للفترة − مصاريف المرتجعات − المصروفات',
    accent: 'chart2',
    icon: TrendingUp,
    trend: 'standard',
  },
];

export const BREAKDOWN_COST_HEADER = 'تكلفة القطع المباعة';

export const SALES_COPY = {
  pageTitle: 'إحصائيات المبيعات',
  subtitle: 'حسب تاريخ إنشاء الطلب، بتوقيت القاهرة',
  storePlaceholder: 'المتاجر',
  carrierPlaceholder: 'شركات الشحن',
  pagePlaceholder: 'الصفحات',
  filterOptionsErrorMessage: 'تعذر تحميل الخيارات',
  approvedOnlyLabel: 'الفواتير المغلقة فقط',
  purchasesClosedChip: 'المغلقة فقط',
  excludedFromAmountNote: 'لم تُحتسب هذه الطلبات في المبلغ',
  excludedFromProfitNote: 'لم تُحتسب هذه الطلبات في الربح',
  missingFeeTooltip: 'حدّد تكلفة الشحن للمحافظة من إعدادات المتجر ← اللوجستيك والمحافظات',
  clearAll: 'مسح الكل',
  breakdownTitle: 'التفصيل حسب النطاق',
  breakdownCostScopeNote: 'متوسط كل الفترات × قطع الفترة المحددة',
  breakdownColumns: [
    'النطاق',
    'الطلبات',
    'المحصلة',
    'المبلغ المورد',
    'القطع',
    BREAKDOWN_COST_HEADER,
    'متوسط الطلب',
    'مصاريف المرتجعات',
    'المصروفات',
    'صافي الربح',
  ],
  totalsRowLabel: 'الإجمالي',
  groupTotalPrefix: 'إجمالي',
  sectionLabels: {
    statuses: 'حالات الطلبات',
    collection: 'قيد التحصيل',
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
  eligibleCountLabel: 'طلبات مؤهلة',
  excludedCountLabel: 'طلبات مستبعدة',
  feeMissingReasonLabel: 'بدون رسوم شحن',
  costMissingReasonLabel: 'بدون متوسط تكلفة',
  amountLabel: 'إجمالي المبلغ',
  piecesCountLabel: 'عدد القطع',
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
  | 'cancelNotes'
  | 'customerPhone'
  | 'deliveredAt'
  | 'collectedAmount'
  | 'isCollected'
  | 'confirmedBy'
  | 'returnReason'
  | 'returnNotes'
  | 'shippingCancelReason'
  | 'shippingCancelNotes'
  | 'governorateFee'
  | 'productsCost'
  | 'pendingProfit'
  | 'exclusionReason';

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
  customerPhone: 'رقم الهاتف',
  deliveredAt: 'تاريخ التسليم',
  collectedAmount: 'مبلغ التحصيل',
  isCollected: 'محصل',
  confirmedBy: 'موظف التأكيد',
  returnReason: 'سبب المرتجع',
  returnNotes: 'ملاحظات المرتجع',
  shippingCancelReason: 'سبب إلغاء الشحن',
  shippingCancelNotes: 'ملاحظات إلغاء الشحن',
  governorateFee: 'رسوم الشحن',
  productsCost: 'تكلفة المنتجات',
  pendingProfit: 'الربح الجاري',
  exclusionReason: 'سبب الاستبعاد',
};

export const SALES_EXCLUSION_REASON_LABELS: Record<SalesExclusionReason, string> = {
  NO_FEE: 'بدون رسوم شحن للمحافظة',
  NO_COST: 'منتج بدون فاتورة شراء',
  NO_FEE_NO_COST: 'بدون رسوم شحن ومنتج بدون فاتورة شراء',
};

export const SALES_DERIVED_KIND_LABELS: Record<SalesDerivedKind, string> = {
  PARTIAL_REMAINDER: 'متبقي جزئي',
  REPLACEMENT: 'بديل',
  EXCHANGE_RETURN: 'تبادل مرتجع',
};

const COMMON_ORDER_COLUMNS: readonly SalesOrderColumn[] = [
  'code',
  'customerName',
  'customerPhone',
  'governorate',
  'city',
  'deliveredAt',
  'totalCost',
  'carrierName',
  'storeOrPage',
  'createdAt',
  'collectedAmount',
  'isCollected',
  'confirmedBy',
  'cancelReason',
  'cancelNotes',
  'returnReason',
  'returnNotes',
  'shippingCancelReason',
  'shippingCancelNotes',
];

export interface SalesSubPageDefinition {
  title: string;
  includesDerived: boolean;
  columns: readonly SalesOrderColumn[];
  withCost: boolean;
  scopeNote?: string;
}

export const SALES_ORDER_SETS: readonly SalesOrderSet[] = [
  'TOTAL',
  'RUNNING',
  'DELIVERED',
  'COLLECTED',
  'CANCELLED',
  'RETURNS',
  'RETURNS_EXPENSES',
  'DELIVERED_COST',
  'PENDING_PROFIT',
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
    title: 'تم الإلغاء',
    includesDerived: false,
    columns: [...COMMON_ORDER_COLUMNS],
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
  DELIVERED_COST: {
    title: 'تكلفة منتجات تم التسليم',
    includesDerived: false,
    columns: [...COMMON_ORDER_COLUMNS, 'productsCost', 'exclusionReason'],
    withCost: true,
  },
  PENDING_PROFIT: {
    title: 'أرباح جاري تحصيلها',
    includesDerived: false,
    columns: [
      ...COMMON_ORDER_COLUMNS,
      'governorateFee',
      'productsCost',
      'pendingProfit',
      'exclusionReason',
    ],
    withCost: true,
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
    scopeNote: SALES_COPY.breakdownCostScopeNote,
  },
};

export function isSalesSubPageSet(value: string): value is SalesSubPageSet {
  return Object.prototype.hasOwnProperty.call(SALES_SUBPAGE_SETS, value);
}

export function isSalesOrderSet(set: SalesSubPageSet): set is SalesOrderSet {
  return (SALES_ORDER_SETS as readonly string[]).includes(set);
}

interface CountForms {
  one: string;
  two: string;
  singular: string;
  plural: string;
  many: string;
}

const ORDER_NOUN_FORMS: CountForms = {
  one: 'طلب واحد',
  two: 'طلبان',
  singular: 'طلب',
  plural: 'طلبات',
  many: 'طلباً',
};

const EXCLUDED_ADJECTIVE_FORMS: CountForms = {
  one: 'مستبعد',
  two: 'مستبعدان',
  singular: 'مستبعد',
  plural: 'مستبعدة',
  many: 'مستبعداً',
};

const PIECE_NOUN_FORMS: CountForms = {
  one: 'قطعة واحدة',
  two: 'قطعتان',
  singular: 'قطعة',
  plural: 'قطع',
  many: 'قطعة',
};

function pickCountForm(count: number, forms: CountForms): string {
  if (count === 1) return forms.one;
  if (count === 2) return forms.two;
  const remainder = count % 100;
  if (remainder <= 2) return forms.singular;
  if (remainder <= 10) return forms.plural;
  return forms.many;
}

function countPhrase(count: number, forms: CountForms): string {
  const word = pickCountForm(count, forms);
  return count === 1 || count === 2 ? word : `${formatCount(count)} ${word}`;
}

export function ordersCountText(count: number): string {
  return countPhrase(count, ORDER_NOUN_FORMS);
}

export function excludedOrdersCountText(count: number): string {
  return `${ordersCountText(count)} ${pickCountForm(count, EXCLUDED_ADJECTIVE_FORMS)}`;
}

export function piecesCountText(count: number): string {
  return countPhrase(count, PIECE_NOUN_FORMS);
}

export function resolveCardHint(card: SalesCardDefinition, approvedOnly: boolean): string {
  return approvedOnly && card.approvedHint ? card.approvedHint : card.hint;
}

export function resolveCardContextChip(
  field: SalesCardField,
  totals: SalesMetrics,
  approvedOnly: boolean,
): SalesCardChip | undefined {
  if (field === 'collectedOrders') {
    if (totals.totalOrders === 0) return undefined;
    const percent = Math.round((totals.collectedOrders / totals.totalOrders) * 100);
    return { tone: 'neutral', text: `${percent}% من الطلبات` };
  }
  if (field === 'runningOrders') {
    return shareChip(totals.runningNormalOrders, totals.totalOrders);
  }
  if (field === 'deliveredOrders') {
    return shareChip(totals.deliveredOrders, totals.totalOrders);
  }
  if (field === 'cancelledOrders') {
    return shareChip(totals.cancelledOrders, totals.totalOrders);
  }
  if (field === 'returnedOrders') {
    return shareChip(totals.returnedNormalOrders, totals.totalOrders);
  }
  if (field === 'suppliedAmount') {
    if (totals.collectedWithoutSettlement <= 0) return undefined;
    return {
      tone: 'warning',
      text: `${ordersCountText(totals.collectedWithoutSettlement)} بدون مبلغ مورد`,
    };
  }
  if (field === 'pendingCollectionAmount') {
    if (totals.ordersWithoutFee <= 0) return undefined;
    return {
      tone: 'warning',
      text: `${ordersCountText(totals.ordersWithoutFee)} بدون رسوم شحن`,
      note: SALES_COPY.excludedFromAmountNote,
      tooltip: SALES_COPY.missingFeeTooltip,
    };
  }
  if (field === 'deliveredProductsCost') {
    if (totals.ordersWithoutCost <= 0) return undefined;
    return {
      tone: 'warning',
      text: `${ordersCountText(totals.ordersWithoutCost)} بدون تكلفة`,
      note: SALES_COPY.excludedFromAmountNote,
    };
  }
  if (field === 'pendingProfit') {
    if (totals.pendingProfitExcludedOrders <= 0) return undefined;
    return {
      tone: 'warning',
      text: `${excludedOrdersCountText(totals.pendingProfitExcludedOrders)}: ${formatCount(totals.ordersWithoutFee)} بدون رسوم شحن، ${formatCount(totals.ordersWithoutCost)} بدون تكلفة`,
      note: SALES_COPY.excludedFromProfitNote,
    };
  }
  if (field === 'soldPiecesCost') {
    if (totals.uncostedPieces <= 0) return undefined;
    return { tone: 'warning', text: `${piecesCountText(totals.uncostedPieces)} بدون تكلفة` };
  }
  if (field === 'purchasesTotal') {
    if (!approvedOnly) return undefined;
    return { tone: 'neutral', text: SALES_COPY.purchasesClosedChip };
  }
  if (field === 'returnsExpense') {
    if (totals.returnsWithoutSettlement <= 0) return undefined;
    return { tone: 'warning', text: `${ordersCountText(totals.returnsWithoutSettlement)} بدون مبلغ` };
  }
  return undefined;
}

function shareChip(part: number, whole: number): SalesCardChip | undefined {
  const percent = formatPercent(part, whole);
  if (percent === null) return undefined;
  return { tone: 'neutral', text: `${percent} من الطلبات` };
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
  if (mode === 'neutral' || mode === 'hidden' || direction === 'flat') return 'neutral';
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
