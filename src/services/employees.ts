import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { getEmployees } from '@/lib/api/employees';

export const useEmployeesQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEES],
    queryFn: getEmployees,
    staleTime: 60 * 1000,
  });
};
