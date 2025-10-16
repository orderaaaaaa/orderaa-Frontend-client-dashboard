import { useEffect, useState } from 'react';
import { DropdownOption } from '@/types';
import { getCategories } from '@/lib/api/lookups';

export default function useCatigories() {
  const [categories, setCategories] = useState<DropdownOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data as DropdownOption[]);
      } catch (error: any) {
        setError(error?.response?.data?.message);
      }
    };
    fetchCategories();
  }, []);

  return { categories, error };
}
