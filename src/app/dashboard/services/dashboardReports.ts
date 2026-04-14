import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import http from '@/lib/api/http';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import type {
  DailySummaryResponse,
  AttemptedResponse,
  RemainingResponse,
  CancelledResponse,
  HourlyChartResponse,
  ByStatusResponse,
  AttemptConversionResponse,
  EditRejectedProductsResponse,
  PackagingInventoryResponse,
  EmployeesListResponse,
  EmployeeStatusResponse,
  EmployeeActivityResponse,
} from '../types';

const reportBaseUrl = '/reports/daily';

export const useDailySummaryQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_SUMMARY] as QueryKey,
    queryFn: async () => {
      const response = await http.get<DailySummaryResponse>(
        `${reportBaseUrl}/summary`,
      );
      return response.data;
    },
  });
};

export const useAttemptedQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_ATTEMPTED] as QueryKey,
    queryFn: async () => {
      const response = await http.get<AttemptedResponse>(
        `${reportBaseUrl}/attempted`,
      );
      return response.data;
    },
    enabled,
  });
};

export const useRemainingQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_REMAINING] as QueryKey,
    queryFn: async () => {
      const response = await http.get<RemainingResponse>(
        `${reportBaseUrl}/not-completed`,
      );
      return response.data;
    },
    enabled,
  });
};

export const useCancelledQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_CANCELLED] as QueryKey,
    queryFn: async () => {
      const response = await http.get<CancelledResponse>(
        `${reportBaseUrl}/cancelled`,
      );
      return response.data;
    },
    enabled,
  });
};

export const useHourlyChartQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_HOURLY_CHART] as QueryKey,
    queryFn: async () => {
      const response = await http.get<HourlyChartResponse>(
        `${reportBaseUrl}/hourly-chart`,
      );
      return response.data;
    },
  });
};

export const useByStatusQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_BY_STATUS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<ByStatusResponse>(
        `${reportBaseUrl}/by-status`,
      );
      return response.data;
    },
  });
};

export const useAttemptConversionQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_ATTEMPT_CONVERSION] as QueryKey,
    queryFn: async () => {
      const response = await http.get<AttemptConversionResponse>(
        `${reportBaseUrl}/attempt-conversion`,
      );
      return response.data;
    },
  });
};

export const useEditRejectedProductsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_EDIT_REJECTED_PRODUCTS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EditRejectedProductsResponse>(
        `${reportBaseUrl}/edit-rejected-products`,
      );
      return response.data;
    },
  });
};

export const useConfirmedProductsReportQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CONFIRMED_PRODUCTS_REPORT] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EditRejectedProductsResponse>(
        `${reportBaseUrl}/confirmed-products-report`,
      );
      return response.data;
    },
    enabled,
  });
};

export const usePackagingInventoryQuery = (status: string, enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PACKAGING_INVENTORY, status] as QueryKey,
    queryFn: async () => {
      const response = await http.get<PackagingInventoryResponse>(
        '/packaging-inventory',
        { params: { status } },
      );
      return response.data;
    },
    enabled,
  });
};

export const usePackagingInventoryCheckMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await http.put('/packaging-inventory/check', { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.PACKAGING_INVENTORY],
      });
    },
  });
};

export const useEmployeesOnlineQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_EMPLOYEES_ONLINE] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EmployeesListResponse>(
        `${reportBaseUrl}/employees/online`,
      );
      return response.data;
    },
    enabled,
  });
};

export const useEmployeesOfflineQuery = (enabled = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_EMPLOYEES_OFFLINE] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EmployeesListResponse>(
        `${reportBaseUrl}/employees/offline`,
      );
      return response.data;
    },
    enabled,
  });
};

export const useEmployeesStatusQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_EMPLOYEES_STATUS] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EmployeeStatusResponse>(
        `${reportBaseUrl}/employees/status`,
      );
      return response.data;
    },
  });
};

export const useEmployeeActivityQuery = (employeeId: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DASHBOARD_EMPLOYEE_ACTIVITY, employeeId] as QueryKey,
    queryFn: async () => {
      const response = await http.get<EmployeeActivityResponse>(
        `${reportBaseUrl}/employees/${employeeId}/activity`,
      );
      return response.data;
    },
    enabled: employeeId !== null,
    staleTime: 0,
  });
};
