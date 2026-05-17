'use client';

import { useMemo } from 'react';
import { useOrderStatusesQuery } from '@/services/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';

export function useStatusLabel() {
  const { data: statuses, isLoading } = useOrderStatusesQuery();

  const statusMap = useMemo(() => {
    if (!statuses) return new Map<string, string>();
    return new Map(statuses.map((s) => [s.key, s.label]));
  }, [statuses]);

  const getStatusLabel = (statusKey: string | null | undefined): string => {
    if (!statusKey) return '';
    return statusMap.get(statusKey) || ORDER_STATUS_ARABIC_LABELS[statusKey] || statusKey;
  };

  return { getStatusLabel, isLoading, statuses };
}
