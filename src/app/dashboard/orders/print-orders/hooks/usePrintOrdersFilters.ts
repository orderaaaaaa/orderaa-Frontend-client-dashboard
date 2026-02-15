'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { PrintStatus } from '../types';
import { useDefaultStatusByPath } from '../../hooks/useDefaultStatusByPath';

export function usePrintOrdersFilters() {
  const urlFilters = useUrlFilters();
  const DEFAULT_STATUS = useDefaultStatusByPath();
  const hasInitialized = useRef(false);
  const [printStatus, setPrintStatusState] = useState<PrintStatus>(null);

  useEffect(() => {
    if (!urlFilters.isInitialized || hasInitialized.current) return;

    hasInitialized.current = true;

    if (!urlFilters.filters.status && DEFAULT_STATUS) {
      urlFilters.setStatus(DEFAULT_STATUS);
    }
  }, [
    urlFilters.isInitialized,
    urlFilters.filters.status,
    urlFilters.setStatus,
    DEFAULT_STATUS,
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
