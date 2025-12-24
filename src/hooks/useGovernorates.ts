import { useQuery } from '@tanstack/react-query';
import { getGovernorates } from '@/lib/api/lookups';
import { DropdownOption } from '@/types';

interface GovernorateApiItem {
  key: string;
  label?: string;
  value?: string;
}

export default function useGovernorates() {
  const {
    data: governorates = [],
    error,
    isLoading,
    isFetching,
  } = useQuery<DropdownOption[], Error>({
    queryKey: ['governorates'],
    queryFn: async () => {
      const data = await getGovernorates() as GovernorateApiItem[];
      return data.map((item) => ({
        key: item.key,
        value: item.label || item.value || '',
      }));
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
