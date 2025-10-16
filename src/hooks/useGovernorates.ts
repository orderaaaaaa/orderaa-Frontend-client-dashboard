import { useEffect, useState } from 'react';
import { getGovernorates } from '@/lib/api/lookups';
import { DropdownOption } from '@/types';

export default function useGovernorates() {
  const [governorates, setGovernorates] = useState<DropdownOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGovernorates = async () => {
      try {
        const data = await getGovernorates();
        setGovernorates(data as DropdownOption[]);
      } catch (error: any) {
        setError(error?.response?.data?.message);
      }
    };
    fetchGovernorates();
  }, []);

  return { governorates, error };
}
