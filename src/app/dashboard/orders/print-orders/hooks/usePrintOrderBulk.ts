'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Order } from '@/types/orders';
import type { UsePrintOrderBulkProps, UsePrintOrderBulkReturn } from '../types';

export function usePrintOrderBulk({
  orders,
}: UsePrintOrderBulkProps): UsePrintOrderBulkReturn {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedById, setSelectedById] = useState<Map<number, Order>>(
    () => new Map()
  );

  const pageById = useMemo(
    () => new Map(orders.map((order) => [order.id, order])),
    [orders]
  );

  const selectedOrders = useMemo(
    () =>
      Array.from(selectedById.values(), (order) => pageById.get(order.id) ?? order),
    [selectedById, pageById]
  );

  const selectedOrderIds = useMemo(
    () => selectedOrders.map((order) => order.id),
    [selectedOrders]
  );

  const allVisibleSelected =
    orders.length > 0 && orders.every((order) => selectedById.has(order.id));

  const handleOrderSelect = useCallback(
    (orderId: number, checked: boolean) => {
      setSelectedById((prev) => {
        const next = new Map(prev);
        if (checked) {
          const order = pageById.get(orderId);
          if (order) next.set(orderId, order);
        } else {
          next.delete(orderId);
        }
        return next;
      });
    },
    [pageById]
  );

  const handleSelectAllToggle = useCallback(() => {
    setSelectedById((prev) => {
      const next = new Map(prev);
      for (const order of orders) {
        if (allVisibleSelected) {
          next.delete(order.id);
        } else {
          next.set(order.id, order);
        }
      }
      return next;
    });
  }, [orders, allVisibleSelected]);

  useEffect(() => {
    if (!selectMode) {
      setSelectedById(new Map());
    }
  }, [selectMode]);

  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
  }, []);

  const clearSelections = useCallback(() => {
    setSelectedById(new Map());
  }, []);

  return {
    selectMode,
    setSelectMode,
    toggleSelectMode,
    selectedOrderIds,
    selectedOrders,
    allVisibleSelected,
    handleOrderSelect,
    handleSelectAllToggle,
    clearSelections,
  };
}
