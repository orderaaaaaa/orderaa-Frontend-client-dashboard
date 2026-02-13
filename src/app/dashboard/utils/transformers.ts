import type {
  DailySummaryResponse,
  AttemptedResponse,
  RemainingResponse,
  CancelledResponse,
  HourlyChartResponse,
  ByStatusResponse,
  AttemptConversionResponse,
  EditRejectedProductsResponse,
  EmployeesListResponse,
  EmployeeStatusResponse,
} from '../types';
import type {
  DashboardSummary,
  FirstAttemptData,
  FollowUpModalData,
  CancelledOrderDetail,
  CallDurationItem,
  OrderStatusDistributionItem,
  ConfirmationAttemptsData,
  PostponedOrderContentItem,
  EmployeeModalData,
  EmployeePerformanceData,
  EmployeeStatusRow,
  EmployeeStopDetailData,
} from '../types';
import {
  ORDER_STATUS_ARABIC_LABELS,
  ORDER_STATUS_CHART_COLORS,
} from '../constants/statusMappings';

export function transformSummary(
  raw: DailySummaryResponse,
): { summary: DashboardSummary; firstAttempt: FirstAttemptData } {
  return {
    summary: {
      activeNow: raw.onlineEmployeesCount,
      stoppedNow: raw.offlineEmployeesCount,
      confirmedOrders: raw.confirmedOrdersCount,
      followUpOrders: raw.attemptedOrdersCount,
      incompleteOrders: raw.notCompletedOrdersCount,
      cancelledOrders: raw.cancelledOrdersCount,
      executedOrders: raw.deliveredCount,
      remainingOrders: raw.remainingOrdersCount,
    },
    firstAttempt: {
      minutes: raw.averageFirstActionTimeMinutes,
    },
  };
}

export function transformAttempted(
  raw: AttemptedResponse,
): FollowUpModalData[] {
  return raw.byNotes.map((item, index) => ({
    id: index + 1,
    status: item.note,
    count: item.count,
    percentage: `${item.percentage}%`,
  }));
}

export function transformRemaining(
  raw: RemainingResponse,
  getStatusLabel?: (key: string) => string,
): FollowUpModalData[] {
  return raw.byStatus.map((item, index) => ({
    id: index + 1,
    status: getStatusLabel
      ? getStatusLabel(item.status)
      : (ORDER_STATUS_ARABIC_LABELS[item.status] ?? item.status),
    count: item.count,
    percentage: `${item.percentage}%`,
  }));
}

export function transformCancelled(raw: CancelledResponse): {
  summaryData: FollowUpModalData[];
  orderDetails: CancelledOrderDetail[];
} {
  const summaryData: FollowUpModalData[] = raw.byReason.map((item, index) => ({
    id: index + 1,
    status: item.reason,
    count: item.count,
    percentage: `${item.percentage}%`,
  }));

  const orderDetails: CancelledOrderDetail[] = raw.orders.map((order) => ({
    id: order.id,
    orderCode: order.code,
    customerName: order.customer.name,
    cancelReason: order.cancelReason,
    notes: order.cancelNote ?? '',
  }));

  return { summaryData, orderDetails };
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 ص';
  if (hour < 12) return `${hour} ص`;
  if (hour === 12) return '12 م';
  return `${hour - 12} م`;
}

const HOURLY_CHART_CONFIG = [
  { key: 'confirmed', label: 'المكالمات المؤكده', seriesName: 'مكالمة مؤكدة' },
  { key: 'cancelled', label: 'المكالمات الملغاه', seriesName: 'مكالمة ملغاه' },
  {
    key: 'attempted',
    label: 'المكالمات الخاصه بالمتابعة',
    seriesName: 'مكالمة متابعة',
  },
  {
    key: 'uncompleted',
    label: 'المكالمات غير المكتمله',
    seriesName: 'مكالمة غير مكتمله',
  },
] as const;

export function transformHourlyChart(
  raw: HourlyChartResponse,
): CallDurationItem[] {
  const categories = Array.from({ length: 24 }, (_, i) => formatHourLabel(i));

  return HOURLY_CHART_CONFIG.map((config) => {
    const entries = raw[config.key];
    const total = entries.reduce((sum, e) => sum + e.count, 0);
    return {
      key: config.key,
      label: config.label,
      value: String(total),
      chartCategories: categories,
      chartSeries: [
        {
          name: config.seriesName,
          data: entries.map((e) => e.count),
        },
      ],
    };
  });
}

export function transformByStatus(
  raw: ByStatusResponse,
  getStatusLabel?: (key: string) => string,
): OrderStatusDistributionItem[] {
  return raw.statuses.map((item) => ({
    label: getStatusLabel
      ? getStatusLabel(item.status)
      : (ORDER_STATUS_ARABIC_LABELS[item.status] ?? item.status),
    value: item.count,
    color: ORDER_STATUS_CHART_COLORS[item.status] ?? '#9ca3af',
  }));
}

const ORDINAL_LABELS = [
  'محاوله اولي',
  'محاوله تانيه',
  'محاوله تالته',
  'محاوله رابعه',
  'محاوله خامسه',
  'محاوله سادسه',
  'محاوله سابعه',
  'محاوله ثامنه',
  'محاوله تاسعه',
  'محاوله عاشره',
];

export function transformAttemptConversion(
  raw: AttemptConversionResponse,
): ConfirmationAttemptsData {
  const sorted = [...raw.conversionByAttempts].sort(
    (a, b) => a.attemptCount - b.attemptCount,
  );
  return {
    categories: sorted.map(
      (item) =>
        ORDINAL_LABELS[item.attemptCount - 1] ??
        `محاولة ${item.attemptCount}`,
    ),
    values: sorted.map((item) => item.confirmedOrders),
  };
}

export function transformEditRejectedProducts(
  raw: EditRejectedProductsResponse,
): PostponedOrderContentItem[] {
  let idCounter = 1;
  const rows: PostponedOrderContentItem[] = [];

  for (const product of raw.products) {
    for (const variant of product.variants) {
      const variantValues = variant.variant.map((v) => v.value);
      rows.push({
        id: idCounter++,
        productName: product.productName,
        variant1: variantValues[0] ?? '',
        variant2: variantValues[1] ?? '',
        quantity: variant.count,
        percentage: variant.percentage,
      });
    }
  }

  return rows;
}

export function formatMinutesToArabic(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} دقيقه`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} ساعات`;
  }

  return `${hours} ساعات و ${minutes} دقيقه`;
}

export function transformEmployeesList(
  raw: EmployeesListResponse,
  status: 'online' | 'offline',
  getStatusLabel?: (key: string) => string,
): {
  employees: EmployeeModalData[];
  performanceData: Record<number, EmployeePerformanceData>;
} {
  const employees: EmployeeModalData[] = raw.employees.map((emp) => ({
    id: emp.employeeId,
    name: emp.employeeName,
    status,
    totalWorkHours: formatMinutesToArabic(emp.totalOnlineTimeMinutes),
    attempts: emp.actionsCount,
  }));

  const performanceData: Record<number, EmployeePerformanceData> = {};

  for (const emp of raw.employees) {
    if (emp.performance.byStatus.length > 0) {
      performanceData[emp.employeeId] = {
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        metrics: emp.performance.byStatus.map((s, index) => ({
          id: index + 1,
          label: getStatusLabel
            ? getStatusLabel(s.status)
            : (ORDER_STATUS_ARABIC_LABELS[s.status] ?? s.status),
          count: s.count,
          percentage: s.percentage,
        })),
      };
    }
  }

  return { employees, performanceData };
}

export function transformEmployeesStatus(
  raw: EmployeeStatusResponse,
): { rows: EmployeeStatusRow[]; detailMap: Record<number, EmployeeStopDetailData> } {
  const rows: EmployeeStatusRow[] = raw.employees.map((emp) => ({
    id: emp.employeeId,
    name: emp.employeeName,
    status: emp.currentStatus,
    totalPauseTime: formatMinutesToArabic(emp.totalPauseMinutesInDay),
    totalPausesInDay: emp.totalPausesInDay,
    totalCallCenterActions: emp.totalCallCenterActions,
    totalWorkingHours: formatMinutesToArabic(emp.totalWorkingHoursMinutes),
  }));

  const detailMap: Record<number, EmployeeStopDetailData> = {};
  for (const emp of raw.employees) {
    detailMap[emp.employeeId] = {
      id: emp.employeeId,
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      status: emp.currentStatus,
      totalWorkingHours: formatMinutesToArabic(emp.totalWorkingHoursMinutes),
      totalPausesInDay: emp.totalPausesInDay,
      totalPauseTime: formatMinutesToArabic(emp.totalPauseMinutesInDay),
      totalCallCenterActions: emp.totalCallCenterActions,
    };
  }

  return { rows, detailMap };
}
