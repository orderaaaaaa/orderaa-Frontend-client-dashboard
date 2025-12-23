import { EmployeeFormData } from '@/schemas/employee.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../../api/employees.api';
import { toast } from 'react-toastify';

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
      const message =
        error?.response?.data?.message || 'حدث خطأ أثناء إضافة الموظف';
      toast.error(message);
    },
  });
};
