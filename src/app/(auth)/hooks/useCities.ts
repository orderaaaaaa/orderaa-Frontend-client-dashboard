import { useEffect, useState } from 'react';
import { getCities } from '@/lib/api/lookups';

interface ComboboxOption {
  key: string;
  value: string;
}

export function useCities(selectedGovernorate: string) {
  const [cities, setCities] = useState<ComboboxOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!selectedGovernorate) {
      setCities([]);
      return;
    }

    setLoadingCities(true);
    getCities(selectedGovernorate)
      .then((cities) => setCities(cities as ComboboxOption[]))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false));
  }, [selectedGovernorate]);

  return {
    cities,
    loadingCities,
  };
}
