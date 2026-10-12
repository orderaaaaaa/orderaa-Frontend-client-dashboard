import { useMemo } from 'react';
import type {
  DashboardSummary,
  EmployeeStatusRow,
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

export interface QuerySectionState {
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

export interface DashboardSectionErrors {
  summary: QuerySectionState;
  employees: QuerySectionState;
  callDurations: QuerySectionState;
  orderStatusDistribution: QuerySectionState;
  confirmationAttempts: QuerySectionState;
  postponedOrdersContent: QuerySectionState;
}

interface QueryLike {
  isError: boolean;
  error: unknown;
  data: unknown;
  refetch: () => unknown;
}

function toSectionState(query: QueryLike): QuerySectionState {
  return {
    isError: query.isError && query.data === undefined,
    error: query.error,
    refetch: () => {
      query.refetch();
    },
  };
}

interface UseDashboardDataReturn {
  summary: DashboardSummary;
  firstAttempt: FirstAttemptData;
  employees: EmployeeStatusRow[];
  callDurations: CallDurationItem[];
  orderStatusDistribution: OrderStatusDistributionItem[];
  confirmationAttempts: ConfirmationAttemptsData;
  postponedOrdersContent: PostponedOrderContentItem[];
  isLoading: boolean;
  errors: DashboardSectionErrors;
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

  const employeeRows = useMemo(
    () =>
      employeesStatusQuery.data
        ? transformEmployeesStatus(employeesStatusQuery.data)
        : [],
    [employeesStatusQuery.data],
  );

  const isLoading =
    summaryQuery.isLoading ||
    hourlyChartQuery.isLoading ||
    byStatusQuery.isLoading ||
    attemptConversionQuery.isLoading ||
    editRejectedQuery.isLoading ||
    employeesStatusQuery.isLoading;

  const errors: DashboardSectionErrors = {
    summary: toSectionState(summaryQuery),
    employees: toSectionState(employeesStatusQuery),
    callDurations: toSectionState(hourlyChartQuery),
    orderStatusDistribution: toSectionState(byStatusQuery),
    confirmationAttempts: toSectionState(attemptConversionQuery),
    postponedOrdersContent: toSectionState(editRejectedQuery),
  };

  return {
    summary,
    firstAttempt,
    employees: employeeRows,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    postponedOrdersContent,
    isLoading,
    errors,
  };
}
