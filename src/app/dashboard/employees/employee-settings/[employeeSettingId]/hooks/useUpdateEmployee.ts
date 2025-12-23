'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmpByID } from '../api/employeeSettings';
import type { Employee } from '../types/employee';
import { toast } from 'react-toastify';

type UpdateEmployeeArgs = {
  id: string;
  updates: Partial<Employee>;
};

export default function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateEmployeeArgs) =>
      updateEmpByID(id, updates),
    onSuccess: (updatedEmployee, variables) => {
      queryClient.setQueryData(['employee', variables.id], updatedEmployee);
      toast.success('تم تحديث البيانات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
