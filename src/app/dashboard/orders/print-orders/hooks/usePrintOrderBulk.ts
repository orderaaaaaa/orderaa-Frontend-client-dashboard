'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Order } from '@/types/orders';
import type { UsePrintOrderBulkProps, UsePrintOrderBulkReturn } from '../types';

export function usePrintOrderBulk({
  orders,
}: UsePrintOrderBulkProps): UsePrintOrderBulkReturn {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectAllMatchingFilters, setSelectAllMatchingFilters] = useState(false);

  const selectedOrders = useMemo(() => {
    return orders.filter((order) => selectedOrderIds.includes(order.id));
  }, [orders, selectedOrderIds]);

  const handleOrderSelect = useCallback(
    (orderId: number, checked: boolean) => {
      if (selectAllMatchingFilters) {
        setSelectAllMatchingFilters(false);
        if (checked) {
          setSelectedOrderIds([orderId]);
        } else {
          setSelectedOrderIds([]);
        }
        return;
      }

      setSelectedOrderIds((prev) => {
        if (checked) {
          return [...prev, orderId];
        } else {
          return prev.filter((id) => id !== orderId);
        }
      });
    },
    [selectAllMatchingFilters]
  );

  const handleSelectAllToggle = useCallback(() => {
    if (selectAllMatchingFilters) {
      setSelectAllMatchingFilters(false);
      setSelectedOrderIds([]);
    } else {
      setSelectAllMatchingFilters(true);
      setSelectedOrderIds([]);
    }
  }, [selectAllMatchingFilters]);

  useEffect(() => {
    if (!selectMode) {
      setSelectedOrderIds([]);
      setSelectAllMatchingFilters(false);
    }
  }, [selectMode]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
  }, []);

  const clearSelections = useCallback(() => {
    setSelectedOrderIds([]);
    setSelectAllMatchingFilters(false);
  }, []);

  return {
    selectMode,
    setSelectMode,
    toggleSelectMode,
    selectedOrderIds,
    selectedOrders,
    selectAllMatchingFilters,
    handleOrderSelect,
    handleSelectAllToggle,
    clearSelections,
  };
}
