import { useQuery } from '@tanstack/react-query';
import { getGovernorates } from '@/lib/api/lookups';
import { DropdownOption } from '@/types';

export default function useGovernorates() {
  const {
    data: governorates = [],
    error,
    isLoading,
    isFetching,
  } = useQuery<DropdownOption[], Error>({
    queryKey: ['governorates'],
    queryFn: async () => {
      const data = await getGovernorates();
      return data as DropdownOption[];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    governorates,
    error: error?.message ?? null,
    isLoading,
    isFetching,
  };
}
