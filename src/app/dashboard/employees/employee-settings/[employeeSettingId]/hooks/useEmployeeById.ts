'use client';

import { useQuery } from '@tanstack/react-query';
import { getEmpByID } from '../api/employeeSettings';

export default function useEmployeeById(id?: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmpByID(id!),
    enabled: !!id,
  });
}
