import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { OrderStatus } from '@/types/orders';
import { useGetNextOrderId, useGetPreviousOrderId } from '@/services/orders';

export interface UseOrderNavigationOptions {
  orderId: number;
  onNavigate?: (targetOrderId: number) => void;
  dateRange?: {
    from: Date | null;
    to: Date | null;
  };
  statusFilter?: OrderStatus | null;
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
  dateRange,
  statusFilter,
}: UseOrderNavigationOptions): UseOrderNavigationReturn {
  const { getNextOrderId } = useGetNextOrderId();
  const { getPreviousOrderId } = useGetPreviousOrderId();

  const [isNavigatingNext, setIsNavigatingNext] = useState(false);
  const [isNavigatingPrevious, setIsNavigatingPrevious] = useState(false);

  const navigateToNext = useCallback(async () => {
    if (!onNavigate) return;

    setIsNavigatingNext(true);
    try {
      const fromISO = dateRange?.from?.toISOString();
      const toISO = dateRange?.to?.toISOString();

      const response = await getNextOrderId(
        orderId,
        statusFilter || undefined,
        fromISO,
        toISO
      );

      if (response?.id) {
        onNavigate(response.id);
      }
    } catch (error: any) {
      console.error('Failed to get next order:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'لا يوجد طلب تالي مطابق للفلاتر';
      toast.info(errorMessage);
    } finally {
      setIsNavigatingNext(false);
    }
  }, [orderId, onNavigate, dateRange, statusFilter, getNextOrderId]);

  const navigateToPrevious = useCallback(async () => {
    if (!onNavigate) return;

    setIsNavigatingPrevious(true);
    try {
      const fromISO = dateRange?.from?.toISOString();
      const toISO = dateRange?.to?.toISOString();

      const response = await getPreviousOrderId(
        orderId,
        statusFilter || undefined,
        fromISO,
        toISO
      );

      if (response?.id) {
        onNavigate(response.id);
      }
    } catch (error: any) {
      console.error('Failed to get previous order:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'لا يوجد طلب سابق مطابق للفلاتر';
      toast.info(errorMessage);
    } finally {
      setIsNavigatingPrevious(false);
    }
  }, [orderId, onNavigate, dateRange, statusFilter, getPreviousOrderId]);

  return {
    navigateToNext,
    navigateToPrevious,
    isNavigatingNext,
    isNavigatingPrevious,
  };
}
