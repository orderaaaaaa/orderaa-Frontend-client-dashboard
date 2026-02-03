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
import {
  MOCK_EMPLOYEE_STATUS,
  CALL_DURATIONS,
  ORDER_STATUS_DISTRIBUTION,
  CONFIRMATION_ATTEMPTS,
  FIRST_ATTEMPT_DATA,
  POSTPONED_ORDERS_CONTENT,
} from '../constants';

interface UseDashboardDataReturn {
  summary: DashboardSummary;
  employees: EmployeeStatusRow[];
  callDurations: CallDurationItem[];
  orderStatusDistribution: OrderStatusDistributionItem[];
  confirmationAttempts: ConfirmationAttemptsData;
  firstAttempt: FirstAttemptData;
  postponedOrdersContent: PostponedOrderContentItem[];
  isLoading: boolean;
}

export function useDashboardData(): UseDashboardDataReturn {
  // TODO: replace when API is ready

  const summary: DashboardSummary = useMemo(
    () => ({
      activeNow: 7,
      stoppedNow: 7,
      confirmedOrders: 99,
      followUpOrders: 99,
      incompleteOrders: 80,
      cancelledOrders: 99,
      executedOrders: 89,
      remainingOrders: 76,
    }),
    [],
  );

  const employees = MOCK_EMPLOYEE_STATUS;
  const callDurations = CALL_DURATIONS;
  const orderStatusDistribution = ORDER_STATUS_DISTRIBUTION;
  const confirmationAttempts = CONFIRMATION_ATTEMPTS;
  const firstAttempt = FIRST_ATTEMPT_DATA;
  const postponedOrdersContent = POSTPONED_ORDERS_CONTENT;

  return {
    summary,
    employees,
    callDurations,
    orderStatusDistribution,
    confirmationAttempts,
    firstAttempt,
    postponedOrdersContent,
    isLoading: false,
  };
}
