import { useEffect, useState } from 'react';
import { getCities } from '@/lib/api/lookups';
import { DropdownOption } from '@/types';

interface CityApiItem {
  key: string;
  label?: string;
  value?: string;
}

export default function useCities(selectedGovernorate: string) {
  const [cities, setCities] = useState<DropdownOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedGovernorate) {
      setCities([]);
      setError(null);
      return;
    }

    const fetchCities = async () => {
      setLoadingCities(true);
      setError(null);
      try {
        const citiesData = await getCities(selectedGovernorate) as CityApiItem[];
        const transformed = citiesData.map((item) => ({
          key: item.key,
          value: item.label || item.value || '',
        }));
        setCities(transformed);
      } catch (err: any) {
        setCities([]);
        setError(err?.message || 'Error fetching cities');
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedGovernorate]);

  return {
    cities,
    loadingCities,
    error,
  };
}
