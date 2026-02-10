import { useMemo } from 'react';
import type {
  FollowUpModalData,
  CancelledOrderDetail,
  EmployeeModalData,
  EmployeePerformanceData,
} from '../types';
import type { SummaryModalType } from './useSummaryModal';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import {
  useAttemptedQuery,
  useRemainingQuery,
  useCancelledQuery,
  useEmployeesOnlineQuery,
  useEmployeesOfflineQuery,
} from '../services';
import {
  transformAttempted,
  transformRemaining,
  transformCancelled,
  transformEmployeesList,
} from '../utils';

interface UseSummaryModalDataReturn {
  followUpModalData: FollowUpModalData[];
  incompleteModalData: FollowUpModalData[];
  cancelledModalSummary: FollowUpModalData[];
  cancelledOrderDetails: CancelledOrderDetail[];
  activeEmployeesModalData: EmployeeModalData[];
  activeEmployeesPerformance: Record<number, EmployeePerformanceData>;
  stoppedEmployeesModalData: EmployeeModalData[];
  stoppedEmployeesPerformance: Record<number, EmployeePerformanceData>;
  isModalLoading: boolean;
}

export function useSummaryModalData(
  modalType: SummaryModalType,
): UseSummaryModalDataReturn {
  const { getStatusLabel } = useStatusLabel();

  const attemptedQuery = useAttemptedQuery(modalType === 'followUp');
  const remainingQuery = useRemainingQuery(modalType === 'incomplete');
  const cancelledQuery = useCancelledQuery(modalType === 'cancelled');
  const employeesOnlineQuery = useEmployeesOnlineQuery(modalType === 'active');
  const employeesOfflineQuery = useEmployeesOfflineQuery(
    modalType === 'stopped',
  );

  const followUpModalData = useMemo(
    () => (attemptedQuery.data ? transformAttempted(attemptedQuery.data) : []),
    [attemptedQuery.data],
  );

  const incompleteModalData = useMemo(
    () =>
      remainingQuery.data
        ? transformRemaining(remainingQuery.data, getStatusLabel)
        : [],
    [remainingQuery.data, getStatusLabel],
  );

  const { cancelledModalSummary, cancelledOrderDetails } = useMemo(() => {
    if (!cancelledQuery.data) {
      return { cancelledModalSummary: [], cancelledOrderDetails: [] };
    }
    const result = transformCancelled(cancelledQuery.data);
    return {
      cancelledModalSummary: result.summaryData,
      cancelledOrderDetails: result.orderDetails,
    };
  }, [cancelledQuery.data]);

  const { activeEmployeesModalData, activeEmployeesPerformance } =
    useMemo(() => {
      if (!employeesOnlineQuery.data) {
        return {
          activeEmployeesModalData: [] as EmployeeModalData[],
          activeEmployeesPerformance: {} as Record<
            number,
            EmployeePerformanceData
          >,
        };
      }
      const result = transformEmployeesList(
        employeesOnlineQuery.data,
        'active',
        getStatusLabel,
      );
      return {
        activeEmployeesModalData: result.employees,
        activeEmployeesPerformance: result.performanceData,
      };
    }, [employeesOnlineQuery.data, getStatusLabel]);

  const { stoppedEmployeesModalData, stoppedEmployeesPerformance } =
    useMemo(() => {
      if (!employeesOfflineQuery.data) {
        return {
          stoppedEmployeesModalData: [] as EmployeeModalData[],
          stoppedEmployeesPerformance: {} as Record<
            number,
            EmployeePerformanceData
          >,
        };
      }
      const result = transformEmployeesList(
        employeesOfflineQuery.data,
        'stopped',
        getStatusLabel,
      );
      return {
        stoppedEmployeesModalData: result.employees,
        stoppedEmployeesPerformance: result.performanceData,
      };
    }, [employeesOfflineQuery.data, getStatusLabel]);

  const isModalLoading =
    (modalType === 'followUp' && attemptedQuery.isLoading) ||
    (modalType === 'incomplete' && remainingQuery.isLoading) ||
    (modalType === 'cancelled' && cancelledQuery.isLoading) ||
    (modalType === 'active' && employeesOnlineQuery.isLoading) ||
    (modalType === 'stopped' && employeesOfflineQuery.isLoading);

  return {
    followUpModalData,
    incompleteModalData,
    cancelledModalSummary,
    cancelledOrderDetails,
    activeEmployeesModalData,
    activeEmployeesPerformance,
    stoppedEmployeesModalData,
    stoppedEmployeesPerformance,
    isModalLoading,
  };
}
