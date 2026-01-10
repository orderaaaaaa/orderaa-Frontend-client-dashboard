'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { PrintStatus } from '../types';

const DEFAULT_STATUS = 'CONFIRMED';

export function usePrintOrdersFilters() {
  const urlFilters = useUrlFilters();
  const hasInitialized = useRef(false);

  const [printStatus, setPrintStatusState] = useState<PrintStatus>(null);

  useEffect(() => {
    if (urlFilters.isInitialized && !hasInitialized.current) {
      hasInitialized.current = true;
      if (!urlFilters.filters.status) {
        urlFilters.setStatus(DEFAULT_STATUS);
      }
    }
  }, [urlFilters.isInitialized, urlFilters.filters.status, urlFilters]);

  const setPrintStatus = useCallback((status: PrintStatus) => {
    setPrintStatusState(status);
    urlFilters.setPage(1);
  }, [urlFilters]);

  const resetAllFilters = useCallback(() => {
    urlFilters.resetFilters();
    setPrintStatusState(null);
    urlFilters.setStatus(DEFAULT_STATUS);
  }, [urlFilters]);

  return {
    ...urlFilters,
    printStatus,
    setPrintStatus,
    resetAllFilters,
  };
}
