'use client';

import { useState, useCallback } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { PrintStatus } from '../types';

export function usePrintOrdersFilters() {
  const urlFilters = useUrlFilters();

  // TODO: Ask BE about how to send printStatus in API payload
  const [printStatus, setPrintStatusState] = useState<PrintStatus>(null);

  const setPrintStatus = useCallback((status: PrintStatus) => {
    setPrintStatusState(status);
    urlFilters.setPage(1);
  }, [urlFilters]);

  const resetAllFilters = useCallback(() => {
    urlFilters.resetFilters();
    setPrintStatusState(null);
  }, [urlFilters]);

  return {
    ...urlFilters,
    printStatus,
    setPrintStatus,
    resetAllFilters,
  };
}
