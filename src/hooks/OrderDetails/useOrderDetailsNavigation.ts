import { useState, useCallback, useRef, useEffect } from 'react';
import { OrderStatus, FilterOrdersDto } from '@/types/orders';
import { OrderFiltersFormData } from '@/schemas/orderFilters.schema';
import { useFetchOrdersForSearch } from '@/services/orders';
import { TimePeriod, calculateDateRangeFromPeriod, formatDateToISO } from '@/utils/dateRangeUtils';

interface UseOrderDetailsNavigationOptions {
  initialOrderId: number;
}

interface UseOrderDetailsNavigationReturn {
  // Filter state
  status: OrderStatus | null;
  setStatus: (status: OrderStatus | null) => void;
  fromDate: Date | null;
  setFromDate: (date: Date | null) => void;
  toDate: Date | null;
  setToDate: (date: Date | null) => void;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  clearTimePeriod: () => void;

  // Navigation result
  targetOrderId: number | null;
  isNavigating: boolean;
  isEmpty: boolean;

  // Filter form integration
  handleFilterFormChange: (data: OrderFiltersFormData) => void;
}

/**
 * Build API filters from all filter sources
 */
function buildApiFilters(
  status: OrderStatus | null,
  fromDate: Date | null,
  toDate: Date | null,
  formFilters: OrderFiltersFormData | null
): FilterOrdersDto {
  const filters: FilterOrdersDto = {
    page: 1,
    limit: 1, // Only need first order
  };

  if (status) filters.status = status;

  // Date range and confirmedDate are mutually exclusive
  // If confirmedDate is set, use that; otherwise use date range
  const hasConfirmedDate = formFilters?.executionDate;

  if (hasConfirmedDate) {
    filters.confirmedDate = formFilters.executionDate;
  } else {
    if (fromDate) filters.createdAfter = formatDateToISO(fromDate);
    if (toDate) filters.createdBefore = formatDateToISO(toDate);
  }

  if (formFilters) {
    if (formFilters.customerName) filters.customerName = formFilters.customerName;
    if (formFilters.phone) filters.customerPhone = formFilters.phone;
    if (formFilters.governorate) filters.governorate = formFilters.governorate;
    if (formFilters.city) filters.city = formFilters.city;
    if (formFilters.area) filters.area = formFilters.area;
    if (formFilters.productName) filters.productName = formFilters.productName;
    if (formFilters.shipmentCode) filters.code = formFilters.shipmentCode;
  }

  return filters;
}

/**
 * Custom hook for managing filter-triggered navigation in order details page.
 * When any filter changes (status, date range, or form filters), it fetches
 * orders from the API and provides the first order's ID for navigation.
 */
export function useOrderDetailsNavigation({
  initialOrderId,
}: UseOrderDetailsNavigationOptions): UseOrderDetailsNavigationReturn {
  const { fetchOrdersForSearch } = useFetchOrdersForSearch();

  // Track if component has mounted (to skip initial render)
  const hasMounted = useRef(false);
  // Track if change was user-initiated (to prevent URL change loops)
  const isUserInitiated = useRef(false);
  // Abort controller for canceling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  // Navigation state
  const [targetOrderId, setTargetOrderId] = useState<number | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Filter state
  const [status, setStatusInternal] = useState<OrderStatus | null>(null);
  const [fromDate, setFromDateInternal] = useState<Date | null>(null);
  const [toDate, setToDateInternal] = useState<Date | null>(null);
  const [timePeriod, setTimePeriodInternal] = useState<TimePeriod>('');
  const [formFilters, setFormFilters] = useState<OrderFiltersFormData | null>(null);
  const [debouncedFormFilters, setDebouncedFormFilters] = useState<OrderFiltersFormData | null>(null);

  // Trigger counter for re-fetching even when values don't change
  const [triggerVersion, setTriggerVersion] = useState(0);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set mounted flag after first render
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  // Wrapped setters that mark user interaction
  const setStatus = useCallback((newStatus: OrderStatus | null) => {
    isUserInitiated.current = true;
    setStatusInternal(newStatus);
    setTriggerVersion((v) => v + 1);
  }, []);

  const setFromDate = useCallback((date: Date | null) => {
    isUserInitiated.current = true;
    setFromDateInternal(date);
    setTimePeriodInternal(''); // Clear time period when manually setting date
  }, []);

  const setToDate = useCallback((date: Date | null) => {
    isUserInitiated.current = true;
    setToDateInternal(date);
    setTimePeriodInternal(''); // Clear time period when manually setting date
  }, []);

  const setTimePeriod = useCallback((period: TimePeriod) => {
    isUserInitiated.current = true;
    setTimePeriodInternal(period);

    // Calculate and set date range based on period
    if (period) {
      const range = calculateDateRangeFromPeriod(period);
      if (range) {
        setFromDateInternal(range.from);
        setToDateInternal(range.to);
      }
    }
  }, []);

  const clearTimePeriod = useCallback(() => {
    isUserInitiated.current = true;
    setTimePeriodInternal('');
    setFromDateInternal(null);
    setToDateInternal(null);
  }, []);

  const handleFilterFormChange = useCallback((data: OrderFiltersFormData) => {
    setFormFilters(data);
  }, []);

  // Debounce form filter changes (500ms delay)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't debounce if formFilters is null (initial state)
    if (formFilters === null) {
      return;
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      isUserInitiated.current = true;
      setDebouncedFormFilters(formFilters);
    }, 500);

    // Cleanup on unmount or when formFilters changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formFilters]);

  // Effect to fetch orders and determine navigation target
  useEffect(() => {
    // Skip if not mounted or not user-initiated
    if (!hasMounted.current || !isUserInitiated.current) {
      return;
    }

    const fetchAndNavigate = async () => {
      // Cancel previous request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsNavigating(true);
      setIsEmpty(false);

      try {
        const filters = buildApiFilters(status, fromDate, toDate, debouncedFormFilters);
        const response = await fetchOrdersForSearch(filters);

        // Check if request was aborted
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        if (response.data && response.data.length > 0) {
          const firstOrderId = response.data[0].id;
          setTargetOrderId(firstOrderId);
          setIsEmpty(false);
        } else {
          setTargetOrderId(null);
          setIsEmpty(true);
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to fetch orders for navigation:', error);
        setIsEmpty(true);
        setTargetOrderId(null);
      } finally {
        setIsNavigating(false);
        isUserInitiated.current = false;
      }
    };

    fetchAndNavigate();

    // Cleanup: abort on unmount or when dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [status, fromDate, toDate, debouncedFormFilters, triggerVersion, fetchOrdersForSearch]);

  return {
    // Filter state
    status,
    setStatus,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    timePeriod,
    setTimePeriod,
    clearTimePeriod,

    // Navigation result
    targetOrderId,
    isNavigating,
    isEmpty,

    // Filter form integration
    handleFilterFormChange,
  };
}
