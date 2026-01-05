'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Order } from '@/types/orders';

interface UseConfirmOrderBulkProps {
  orders: Order[];
}

export function useConfirmOrderBulk({ orders }: UseConfirmOrderBulkProps) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectAllMatchingFilters, setSelectAllMatchingFilters] = useState(false);

  // Get selected orders as Order objects
  const selectedOrders = useMemo(() => {
    return orders.filter((order) => selectedOrderIds.includes(order.id));
  }, [orders, selectedOrderIds]);

  // Handle order selection
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

  // Handle select all toggle
  const handleSelectAllToggle = useCallback(() => {
    if (selectAllMatchingFilters) {
      setSelectAllMatchingFilters(false);
      setSelectedOrderIds([]);
    } else {
      setSelectAllMatchingFilters(true);
      setSelectedOrderIds([]);
    }
  }, [selectAllMatchingFilters]);

  // Clear selection when select mode is turned off
  useEffect(() => {
    if (!selectMode) {
      setSelectedOrderIds([]);
      setSelectAllMatchingFilters(false);
    }
  }, [selectMode]);

  // Toggle select mode
  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
  }, []);

  // Clear all selections
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
