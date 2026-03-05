'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { OrderFilters } from '@/types/orders';
import { TimePeriod, calculateDateRangeFromPeriod } from '@/utils/dateRangeUtils';
import {
  UrlFilterState,
  DEFAULT_FILTER_STATE,
  parseFiltersFromUrl,
  serializeFiltersToUrl,
} from '@/utils/urlFilters';
import { useDebouncedCallback } from '@/utils/debounce';
import { toast } from 'react-toastify';

interface UseUrlFiltersReturn {
  // Current filter state
  filters: UrlFilterState;

  // Update functions (auto-sync to URL)
  setStatus: (status: string | null) => void;
  setSearch: (search: string) => void;
  setFromDate: (date: Date | null) => void;
  setToDate: (date: Date | null) => void;
  setTimePeriod: (period: TimePeriod) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  updateLocalFilters: (filters: Partial<OrderFilters>) => void;
  resetFilters: () => void;

  // Loading state
  isInitialized: boolean;
}

export function useUrlFilters(): UseUrlFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Track initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Internal state (synced with URL)
  const [filters, setFilters] = useState<UrlFilterState>(DEFAULT_FILTER_STATE);

  // Track pending URL update type (null = no pending, 'push' or 'replace')
  const pendingUrlUpdate = useRef<'push' | 'replace' | null>(null);

  // Ref to track if we're currently updating URL to prevent loops
  const isUpdatingUrl = useRef(false);

  // Ref to store the previous URL params string for comparison
  const prevParamsString = useRef<string>('');

  // Initialize from URL on mount
  useEffect(() => {
    if (!searchParams) return;

    const currentParamsString = searchParams.toString();

    // Only parse if params changed (handles browser back/forward)
    if (currentParamsString !== prevParamsString.current) {
      prevParamsString.current = currentParamsString;

      // Skip if we're the ones updating the URL
      if (isUpdatingUrl.current) {
        isUpdatingUrl.current = false;
        return;
      }

      const parsed = parseFiltersFromUrl(searchParams);
      setFilters(parsed);
    }

    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Sync URL with state changes - runs AFTER state update
  useEffect(() => {
    if (!isInitialized || pendingUrlUpdate.current === null) return;

    const params = serializeFiltersToUrl(filters);
    const newParamsString = params.toString();
    const newUrl = newParamsString ? `${pathname}?${newParamsString}` : pathname;

    isUpdatingUrl.current = true;
    prevParamsString.current = newParamsString;

    const updateType = pendingUrlUpdate.current;
    pendingUrlUpdate.current = null;

    if (updateType === 'replace') {
      router.replace(newUrl, { scroll: false });
    } else {
      router.push(newUrl, { scroll: false });
    }
  }, [filters, isInitialized, pathname, router]);

  // Helper to schedule URL update after state change
  const scheduleUrlUpdate = useCallback((type: 'push' | 'replace') => {
    pendingUrlUpdate.current = type;
  }, []);

  // Debounced URL update for text inputs (uses replace to avoid history spam)
  const debouncedScheduleUrlUpdate = useDebouncedCallback(
    () => {
      scheduleUrlUpdate('replace');
    },
    500
  );

  // Set status (immediate update with history)
  const setStatus = useCallback(
    (status: string | null) => {
      setFilters((prev) => {
        const newFilters = { ...prev, status, page: 1 };
        return newFilters;
      });
      scheduleUrlUpdate('push');
    },
    [scheduleUrlUpdate]
  );

  // Set search (debounced update)
  const setSearch = useCallback(
    (search: string) => {
      setFilters((prev) => {
        const newFilters = { ...prev, search, page: 1 };
        return newFilters;
      });
      debouncedScheduleUrlUpdate();
    },
    [debouncedScheduleUrlUpdate]
  );

  // Set from date (immediate update with history, handles mutual exclusivity)
  const setFromDate = useCallback(
    (date: Date | null) => {
      let shouldUpdate = true;
      setFilters((prev) => {
        // Block if executionDate is set
        if (date && prev.localFilters.executionDate) {
          toast.error(
            'لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.'
          );
          shouldUpdate = false;
          return prev;
        }

        const newFilters = {
          ...prev,
          fromDate: date,
          // Clear time period when manually setting date
          timePeriod: '' as TimePeriod,
          page: 1,
        };
        return newFilters;
      });
      if (shouldUpdate) {
        scheduleUrlUpdate('push');
      }
    },
    [scheduleUrlUpdate]
  );

  // Set to date (immediate update with history, handles mutual exclusivity)
  const setToDate = useCallback(
    (date: Date | null) => {
      let shouldUpdate = true;
      setFilters((prev) => {
        // Block if executionDate is set
        if (date && prev.localFilters.executionDate) {
          toast.error(
            'لا يمكن تحديد نطاق التاريخ وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.'
          );
          shouldUpdate = false;
          return prev;
        }

        const newFilters = {
          ...prev,
          toDate: date,
          // Clear time period when manually setting date
          timePeriod: '' as TimePeriod,
          page: 1,
        };
        return newFilters;
      });
      if (shouldUpdate) {
        scheduleUrlUpdate('push');
      }
    },
    [scheduleUrlUpdate]
  );

  // Set time period (immediate update with history, calculates date range)
  const setTimePeriod = useCallback(
    (period: TimePeriod) => {
      let shouldUpdate = true;
      setFilters((prev) => {
        // Block if executionDate is set
        if (period && prev.localFilters.executionDate) {
          toast.error(
            'لا يمكن تحديد الفترة الزمنية وتاريخ التنفيذ معاً. يرجى إزالة تاريخ التنفيذ أولاً.'
          );
          shouldUpdate = false;
          return prev;
        }

        // Calculate date range from period
        const dateRange = calculateDateRangeFromPeriod(period);

        const newFilters = {
          ...prev,
          timePeriod: period,
          fromDate: dateRange?.from ?? null,
          toDate: dateRange?.to ?? null,
          page: 1,
        };
        return newFilters;
      });
      if (shouldUpdate) {
        scheduleUrlUpdate('push');
      }
    },
    [scheduleUrlUpdate]
  );

  // Set page (immediate update with history)
  const setPage = useCallback(
    (page: number) => {
      setFilters((prev) => {
        const newFilters = { ...prev, page };
        return newFilters;
      });
      scheduleUrlUpdate('push');
    },
    [scheduleUrlUpdate]
  );

  // Set limit (immediate update with history, resets page)
  const setLimit = useCallback(
    (limit: number) => {
      setFilters((prev) => {
        const newFilters = { ...prev, limit, page: 1 };
        return newFilters;
      });
      scheduleUrlUpdate('push');
    },
    [scheduleUrlUpdate]
  );

  // Update local filters (handles mutual exclusivity and hierarchical filters)
  const updateLocalFilters = useCallback(
    (newLocalFilters: Partial<OrderFilters>) => {
      // Determine if this is a text input (should be debounced)
      const textFields = ['customerName', 'phone', 'shipmentCode', 'address', 'search'];
      const isTextInput = Object.keys(newLocalFilters).some((key) =>
        textFields.includes(key) && !!newLocalFilters[key as keyof OrderFilters]
      );

      let shouldUpdate = true;

      setFilters((prev) => {
        // Block executionDate if date range is set
        if (newLocalFilters.executionDate && (prev.fromDate || prev.toDate)) {
          toast.error(
            'لا يمكن تحديد تاريخ التنفيذ ونطاق التاريخ معاً. يرجى إزالة نطاق التاريخ أولاً.'
          );
          // Remove executionDate from the update
          const { executionDate, ...restFilters } = newLocalFilters;
          if (Object.keys(restFilters).length === 0) {
            shouldUpdate = false;
            return prev;
          }
          newLocalFilters = restFilters;
        }

        // Handle hierarchical filters: governorate change clears city and area
        let updatedLocalFilters = { ...prev.localFilters, ...newLocalFilters };

        if (
          newLocalFilters.governorate !== undefined &&
          newLocalFilters.governorate !== prev.localFilters.governorate
        ) {
          updatedLocalFilters.city = '';
          updatedLocalFilters.area = '';
        }

        const newFilters = {
          ...prev,
          localFilters: updatedLocalFilters,
          page: 1,
        };

        // Clear date range and time period if executionDate is being set
        if (newLocalFilters.executionDate) {
          newFilters.fromDate = null;
          newFilters.toDate = null;
          newFilters.timePeriod = '';
        }

        return newFilters;
      });

      if (shouldUpdate) {
        if (isTextInput) {
          debouncedScheduleUrlUpdate();
        } else {
          scheduleUrlUpdate('push');
        }
      }
    },
    [scheduleUrlUpdate, debouncedScheduleUrlUpdate]
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTER_STATE });
    scheduleUrlUpdate('push');
  }, [scheduleUrlUpdate]);

  return {
    filters,
    setStatus,
    setSearch,
    setFromDate,
    setToDate,
    setTimePeriod,
    setPage,
    setLimit,
    updateLocalFilters,
    resetFilters,
    isInitialized,
  };
}
