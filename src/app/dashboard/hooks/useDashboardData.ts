import { useMemo } from 'react';
import type { DashboardSummary, EmployeeStatusRow, CallDurationItem } from '../types';
import { MOCK_EMPLOYEE_STATUS, CALL_DURATIONS } from '../constants';

interface UseDashboardDataReturn {
  summary: DashboardSummary;
  employees: EmployeeStatusRow[];
  callDurations: CallDurationItem[];
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

  return {
    summary,
    employees,
    callDurations,
    isLoading: false,
  };
}
