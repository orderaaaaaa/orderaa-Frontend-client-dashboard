'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { updateEmpByID } from '../api/employeeSettings';
import type { Employee } from '../types/employee';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';

type UpdateEmployeeArgs = {
  id: string;
  updates: Partial<Employee>;
};

export default function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ id, updates }: UpdateEmployeeArgs) =>
      updateEmpByID(id, updates),
    onSuccess: (_updatedEmployee, variables) => {
      // Do NOT seed the cache with the PATCH response: it omits `roles`, and a
      // roles-less cached employee makes the settings form diff against stale
      // state and wipe assignments. Refetch instead.
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
      toast.success('تم تحديث البيانات بنجاح');
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      router.push('/dashboard/employees');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'تعذر تحديث بيانات الموظف'));
    },
  });
}
