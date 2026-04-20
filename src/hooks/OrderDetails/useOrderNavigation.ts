import { useState, useCallback, useRef, useEffect } from 'react';
import { formatLocalStartOfDay, formatLocalEndOfDay } from '@/utils/dateRangeUtils';
import { toast } from 'react-toastify';
import { FilterOrdersDto, OrderStatus } from '@/types/orders';
import { useGetNextOrderId, useGetPreviousOrderId } from '@/services/orders';

export interface UseOrderNavigationOptions {
  orderId: number;
  onNavigate?: (targetOrderId: number) => void;
  onNoOrdersFound?: () => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: string | null;
  navigationFilters?: FilterOrdersDto;
}

function buildNavFilters(
  navigationFilters: FilterOrdersDto | undefined,
  statusFilter: string | null | undefined,
  dateRange: { from: Date | null; to: Date | null } | undefined
): FilterOrdersDto {
  if (navigationFilters) {
    return navigationFilters;
  }
  const filters: FilterOrdersDto = {};
  if (statusFilter) filters.status = statusFilter;
  if (dateRange?.from) filters.createdAfter = formatLocalStartOfDay(dateRange.from);
  if (dateRange?.to) filters.createdBefore = formatLocalEndOfDay(dateRange.to);
  return filters;
}

export interface UseOrderNavigationReturn {
  navigateToNext: () => Promise<void>;
  navigateToPrevious: () => Promise<void>;
  isNavigatingNext: boolean;
  isNavigatingPrevious: boolean;
}

export function useOrderNavigation({
  orderId,
  onNavigate,
  onNoOrdersFound,
  dateRange,
  statusFilter,
  navigationFilters,
}: UseOrderNavigationOptions): UseOrderNavigationReturn {
  const { getNextOrderId } = useGetNextOrderId();
  const { getPreviousOrderId } = useGetPreviousOrderId();

  const [isNavigatingNext, setIsNavigatingNext] = useState(false);
  const [isNavigatingPrevious, setIsNavigatingPrevious] = useState(false);

  // Use ref to always have access to the latest callback in async operations
  const onNoOrdersFoundRef = useRef(onNoOrdersFound);
  useEffect(() => {
    onNoOrdersFoundRef.current = onNoOrdersFound;
  }, [onNoOrdersFound]);

  const navigateToNext = useCallback(async () => {
    if (!onNavigate) return;

    setIsNavigatingNext(true);
    try {
      const filters = buildNavFilters(navigationFilters, statusFilter, dateRange);
      const response = await getNextOrderId(orderId, filters);

      if (response?.id) {
        onNavigate(response.id);
      } else if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        toast.info('لا يوجد طلب تالي مطابق للفلاتر');
      }
    } catch (error: any) {
      console.error('Failed to get next order:', error);
      if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          'لا يوجد طلب تالي مطابق للفلاتر';
        toast.info(errorMessage);
      }
    } finally {
      setIsNavigatingNext(false);
    }
  }, [orderId, onNavigate, dateRange, statusFilter, navigationFilters, getNextOrderId]);

  const navigateToPrevious = useCallback(async () => {
    if (!onNavigate) return;

    setIsNavigatingPrevious(true);
    try {
      const filters = buildNavFilters(navigationFilters, statusFilter, dateRange);
      const response = await getPreviousOrderId(orderId, filters);

      if (response?.id) {
        onNavigate(response.id);
      } else if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        toast.info('لا يوجد طلب سابق مطابق للفلاتر');
      }
    } catch (error: any) {
      console.error('Failed to get previous order:', error);
      if (onNoOrdersFoundRef.current) {
        onNoOrdersFoundRef.current();
      } else {
        const errorMessage =
          error?.response?.data?.message ||
          'لا يوجد طلب سابق مطابق للفلاتر';
        toast.info(errorMessage);
      }
    } finally {
      setIsNavigatingPrevious(false);
    }
  }, [orderId, onNavigate, dateRange, statusFilter, navigationFilters, getPreviousOrderId]);

  return {
    navigateToNext,
    navigateToPrevious,
    isNavigatingNext,
    isNavigatingPrevious,
  };
}
