'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { PrintStatus } from '../types';
import { useDefaultStatusByPath } from '../../hooks/useDefaultStatusByPath';

export function usePrintOrdersFilters(
  storageKey?: string,
  options: { ignoreDateRange?: boolean; forceDefaultStatus?: boolean } = {},
) {
  const { forceDefaultStatus = false } = options;
  const urlFilters = useUrlFilters(storageKey, options);
  const DEFAULT_STATUS = useDefaultStatusByPath();
  const hasInitialized = useRef(false);
  const [printStatus, setPrintStatusState] = useState<PrintStatus>(null);

  useEffect(() => {
    if (!urlFilters.isInitialized || hasInitialized.current) return;

    hasInitialized.current = true;

    if (!DEFAULT_STATUS) return;

    const shouldApplyDefault = forceDefaultStatus || !urlFilters.filters.status;
    if (shouldApplyDefault && urlFilters.filters.status !== DEFAULT_STATUS) {
      urlFilters.setStatus(DEFAULT_STATUS);
    }
  }, [
    urlFilters.isInitialized,
    urlFilters.filters.status,
    urlFilters.setStatus,
    DEFAULT_STATUS,
    forceDefaultStatus,
  ]);

  const setPrintStatus = useCallback((status: PrintStatus) => {
    setPrintStatusState(status);
    urlFilters.setPage(1);
  }, [urlFilters.setPage]);

  const resetAllFilters = useCallback(() => {
    urlFilters.resetFilters();
    setPrintStatusState(null);

    if (DEFAULT_STATUS) {
      urlFilters.setStatus(DEFAULT_STATUS);
    }
  }, [urlFilters.resetFilters, urlFilters.setStatus, DEFAULT_STATUS]);

  return {
    ...urlFilters,
    printStatus,
    setPrintStatus,
    resetAllFilters,
  };
}
