import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi } from '@/lib/api/employees.api';
import { Employee, EmployeeFormData } from '@/schemas/employee.schema';

// Fetch all employees
export const useEmployees = () => {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      return await employeesApi.getAll();
    },
  });
};

// Create employee
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EmployeeFormData) => {
      return await employeesApi.create(data);
    },
    onSuccess: () => {
      toast.success('تم إضافة الموظف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف'
      );
    },
  });
};

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
    mutationFn: async ({
      id,
      isOnline,
    }: {
      id: number;
      isOnline: boolean;
    }) => {
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
