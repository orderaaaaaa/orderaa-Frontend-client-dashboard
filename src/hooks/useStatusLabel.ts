'use client';

import { useMemo } from 'react';
import { useOrderStatusesQuery } from '@/services/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';

export function useStatusLabel() {
  const { data, isLoading } = useOrderStatusesQuery();

  // Label lookups read `allStatuses` — the complete, unfiltered dictionary.
  // Building this from the permission-filtered `statuses` is what used to leak
  // raw enum keys for statuses outside the caller's window.
  const statusMap = useMemo(() => {
    if (!data) return new Map<string, string>();
    return new Map(data.allStatuses.map((s) => [s.key, s.label]));
  }, [data]);

  const getStatusLabel = (statusKey: string | null | undefined): string => {
    if (!statusKey) return '';
    return statusMap.get(statusKey) || ORDER_STATUS_ARABIC_LABELS[statusKey] || statusKey;
  };

  return { getStatusLabel, isLoading, statuses: data?.statuses };
}
