import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { employeesApi } from '@/app/dashboard/employees/api/employees.api';
import {
  Employee,
  EmployeeFormData,
  EmployeeFilters,
  PaginatedEmployeesResponse,
} from '@/schemas/employee.schema';
import { EmployeeAttendanceResponse } from '../types/attendance.types';

// Fetch all employees
export const useEmployees = (options?: { enabled?: boolean }) =>
  useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      return await employeesApi.getAll();
    },
    enabled: options?.enabled ?? true,
  });

// Fetch filtered and paginated employees
export const useFilteredEmployees = (
  filters: EmployeeFilters,
  options?: { enabled?: boolean }
) =>
  useQuery<PaginatedEmployeesResponse>({
    queryKey: ['employees', 'filtered', filters],
    queryFn: async () => {
      return await employeesApi.getFiltered(filters);
    },
    enabled: options?.enabled ?? true,
  });

// Update employee
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<EmployeeFormData>;
    }) => {
      return await employeesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Update employee status
export const useUpdateEmployeeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isOnline }: { id: number; isOnline: boolean }) => {
      return await employeesApi.updateStatus(id, isOnline);
    },
    onSuccess: () => {
      toast.success('تم تحديث حالة الموظف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'حدث خطأ أثناء تحديث حالة الموظف'
      );
    },
  });
};

// Update employee performance
export const useUpdateEmployeePerformance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      performanceScore,
      performanceChange,
    }: {
      id: number;
      performanceScore: number;
      performanceChange: number;
    }) => {
      return await employeesApi.updatePerformance(id, {
        performanceScore,
        performanceChange,
      });
    },
    onSuccess: () => {
      toast.success('تم تحديث أداء الموظف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'حدث خطأ أثناء تحديث أداء الموظف'
      );
    },
  });
};

// Update employee attendance
export const useUpdateEmployeeAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      workingDays,
      leaveDays,
    }: {
      id: number;
      workingDays: number;
      leaveDays: number;
    }) => {
      return await employeesApi.updateAttendance(id, {
        workingDays,
        leaveDays,
      });
    },
    onSuccess: () => {
      toast.success('تم تحديث حضور الموظف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'حدث خطأ أثناء تحديث حضور الموظف'
      );
    },
  });
};

// Delete employee
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await employeesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

// Get employee attendance by month
export const useEmployeeAttendance = (
  id: number,
  month: string,
  enabled = true
) => {
  return useQuery<EmployeeAttendanceResponse>({
    queryKey: ['employees', id, 'attendance', month],
    queryFn: async () => {
      return await employeesApi.getAttendance(id, month);
    },
    enabled: enabled && !!id && !!month,
  });
};
