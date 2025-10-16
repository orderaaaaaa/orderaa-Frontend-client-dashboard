import { useEffect, useState } from 'react';
import { getCategories, getGovernorates, getCities } from '@/lib/api/lookups';

interface ComboboxOption {
  key: string;
  value: string;
}

export function useAuthData() {
  const [categories, setCategories] = useState<ComboboxOption[]>([]);
  const [governorates, setGovernorates] = useState<ComboboxOption[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), getGovernorates()])
      .then(([cats, govs]) => {
        setCategories(cats as ComboboxOption[]);
        setGovernorates(govs as ComboboxOption[]);
      })
      .catch(() => setError('حدث خطأ أثناء تحميل البيانات.'));
  }, []);

  return {
    categories,
    governorates,
    error,
    setError,
  };
}
