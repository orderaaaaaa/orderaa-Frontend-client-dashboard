'use client';

import { useEffect, useMemo } from 'react';
import { useQueries, useQuery, type QueryKey } from '@tanstack/react-query';
import { getLocationOptionCities, getLocationOptionGovernorates } from '@/lib/api/lookups';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { retryUnlessClientError } from '@/services/lookups';
import type { LocationOption } from '@/types/locationOptions';
import type { ChangeCompanyRow } from '../types/bulkCompanySwitch';
import type { PickOption } from '../utils/switchRows';

interface UseChangeCompanyLocationsArgs {
  rows: ChangeCompanyRow[];
  targetId: number | null;
  onPatch: (orderId: number, patch: Partial<ChangeCompanyRow>) => void;
  onPickGovernorate: (orderId: number, option: PickOption | null) => void;
  onPickCity: (orderId: number, option: PickOption | null) => void;
}

export function useChangeCompanyLocations({
  rows,
  targetId,
  onPatch,
  onPickGovernorate,
  onPickCity,
}: UseChangeCompanyLocationsArgs) {
  const governorates = useQuery({
    queryKey: [QUERY_KEYS.LOCATION_OPTION_GOVERNORATES, targetId, null] as QueryKey,
    queryFn: () => getLocationOptionGovernorates(targetId as number),
    enabled: targetId !== null,
    retry: retryUnlessClientError,
  });
  const governorateData = governorates.data;

  const uniqueGovernorates = useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((row) => row.picks.governorateOption)
            .filter((governorateOption): governorateOption is string => governorateOption !== null),
        ),
      ),
    [rows],
  );

  const cityQueries = useQueries({
    queries: uniqueGovernorates.map((governorateOption) => ({
      queryKey: [
        QUERY_KEYS.LOCATION_OPTION_CITIES,
        targetId,
        governorateOption,
        null,
      ] as QueryKey,
      queryFn: () => getLocationOptionCities(targetId as number, governorateOption),
      enabled: targetId !== null,
      retry: retryUnlessClientError,
    })),
  });

  const cityQueryByGovernorate = useMemo(
    () =>
      new Map(
        uniqueGovernorates.map((governorateOption, index) => [governorateOption, cityQueries[index]] as const),
      ),
    [uniqueGovernorates, cityQueries],
  );

  useEffect(() => {
    if (targetId === null || !governorateData) return;
    for (const row of rows) {
      if (row.prefillTargetId === targetId) continue;
      const current = (row.order.governorate ?? '').trim();
      const match = governorateData.options.find((option) => option.label.trim() === current);
      if (match && row.picks.governorateOption === null) {
        onPickGovernorate(row.order.id, { value: match.value, label: match.label });
      }
      onPatch(row.order.id, { prefillTargetId: targetId });
    }
  }, [targetId, governorateData, rows, onPatch, onPickGovernorate]);

  useEffect(() => {
    rows.forEach((row) => {
      const governorateOption = row.picks.governorateOption;
      if (governorateOption === null) return;
      const cities = cityQueryByGovernorate.get(governorateOption)?.data;
      if (!cities) return;
      if (row.cityPrefillKey === governorateOption) return;
      const current = (row.order.city ?? '').trim();
      const match = cities.options.find((option) => option.label.trim() === current);
      if (match && row.picks.cityOption === null) {
        onPickCity(row.order.id, { value: match.value, label: match.label });
      }
      onPatch(row.order.id, { cityPrefillKey: governorateOption });
    });
  }, [rows, cityQueryByGovernorate, onPatch, onPickCity]);

  const governorateOptions: LocationOption[] = governorateData?.options ?? [];
  const cityOptionsByRow: LocationOption[][] = rows.map((row) => {
    const governorateOption = row.picks.governorateOption;
    if (governorateOption === null) return [];
    return cityQueryByGovernorate.get(governorateOption)?.data?.options ?? [];
  });

  return { governorateOptions, cityOptionsByRow };
}
