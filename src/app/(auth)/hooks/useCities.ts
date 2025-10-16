import { useEffect, useState } from 'react';
import { getCities } from '@/lib/api/lookups';
import { DropdownOption } from '@/types';

export function useCities(selectedGovernorate: string) {
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
        const citiesData = await getCities(selectedGovernorate);
        setCities(citiesData as DropdownOption[]);
      } catch (err: any) {
        setCities([]);
        setError(err?.message || 'Error fetching cities');
        console.error('Error fetching cities:', err);
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
