import { useMemo } from 'react';
import type {
  DashboardSummary,
  EmployeeStatusRow,
  EmployeeStopDetailData,
  CallDurationItem,
  OrderStatusDistributionItem,
  ConfirmationAttemptsData,
  FirstAttemptData,
  PostponedOrderContentItem,
} from '../types';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  useDailySummaryQuery,
  useHourlyChartQuery,
  useByStatusQuery,
  useAttemptConversionQuery,
  useEditRejectedProductsQuery,
  useEmployeesStatusQuery,
} from '../services';
import {
  transformSummary,
  transformHourlyChart,
  transformByStatus,
  transformAttemptConversion,
  transformEditRejectedProducts,
  transformEmployeesStatus,
} from '../utils';

const DEFAULT_SUMMARY: DashboardSummary = {
  activeNow: 0,
  stoppedNow: 0,
  confirmedOrders: 0,
  followUpOrders: 0,
  incompleteOrders: 0,
  cancelledOrders: 0,
  executedOrders: 0,
  remainingOrders: 0,
};

const DEFAULT_FIRST_ATTEMPT: FirstAttemptData = { minutes: 0 };

interface UseDashboardDataReturn {
  summary: DashboardSummary;
  firstAttempt: FirstAttemptData;
  employees: EmployeeStatusRow[];
  employeeDetailMap: Record<number, EmployeeStopDetailData>;
  callDurations: CallDurationItem[];
  orderStatusDistribution: OrderStatusDistributionItem[];
  confirmationAttempts: ConfirmationAttemptsData;
  postponedOrdersContent: PostponedOrderContentItem[];
  isLoading: boolean;
}

export function useDashboardData(): UseDashboardDataReturn {
  const { getStatusLabel } = useStatusLabel();

  const summaryQuery = useDailySummaryQuery();
  const hourlyChartQuery = useHourlyChartQuery();
  const byStatusQuery = useByStatusQuery();
  const attemptConversionQuery = useAttemptConversionQuery();
  const editRejectedQuery = useEditRejectedProductsQuery();
  const employeesStatusQuery = useEmployeesStatusQuery();

  const { summary, firstAttempt } = useMemo(() => {
    if (!summaryQuery.data) {
      return { summary: DEFAULT_SUMMARY, firstAttempt: DEFAULT_FIRST_ATTEMPT };
    }
    return transformSummary(summaryQuery.data);
  }, [summaryQuery.data]);

  const callDurations = useMemo(
    () =>
      hourlyChartQuery.data
        ? transformHourlyChart(hourlyChartQuery.data)
        : [],
    [hourlyChartQuery.data],
  );

  const orderStatusDistribution = useMemo(
    () =>
      byStatusQuery.data
        ? transformByStatus(byStatusQuery.data, getStatusLabel)
        : [],
    [byStatusQuery.data, getStatusLabel],
  );

  const confirmationAttempts = useMemo(
    () =>
      attemptConversionQuery.data
        ? transformAttemptConversion(attemptConversionQuery.data)
        : { categories: [], values: [] },
    [attemptConversionQuery.data],
  );

  const postponedOrdersContent = useMemo(
    () =>
      editRejectedQuery.data
        ? transformEditRejectedProducts(editRejectedQuery.data)
        : [],
    [editRejectedQuery.data],
  );

  const { rows: employeeRows, detailMap: employeeDetailMap } = useMemo(
    () =>
      employeesStatusQuery.data
        ? transformEmployeesStatus(employeesStatusQuery.data)
        : { rows: [], detailMap: {} },
    [employeesStatusQuery.data],
  );

  const isLoading =
    summaryQuery.isLoading ||
    hourlyChartQuery.isLoading ||
    byStatusQuery.isLoading ||
    attemptConversionQuery.isLoading ||
    editRejectedQuery.isLoading ||
    employeesStatusQuery.isLoading;

  return {
    summary,
    firstAttempt,
    employees: employeeRows,
    employeeDetailMap,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    postponedOrdersContent,
    isLoading,
  };
}
