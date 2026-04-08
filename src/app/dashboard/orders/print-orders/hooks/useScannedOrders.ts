'use client';

import { useState, useCallback, useMemo } from 'react';
import groupBy from 'lodash/groupBy';
import type {
  ScannedOrder,
  AddOrderInput,
  NonConfirmedGroup,
  UseScannedOrdersReturn,
} from '../types';

export type { ScannedOrder, AddOrderInput };

export function useScannedOrders(): UseScannedOrdersReturn {
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const hasOrder = useCallback(
    (code: string) => {
      return scannedOrders.some(
        (order) => order.code.toLowerCase() === code.toLowerCase()
      );
    },
    [scannedOrders]
  );

  const addOrder = useCallback(
    (order: AddOrderInput): boolean => {
      if (hasOrder(order.code)) {
        return false;
      }

      setScannedOrders((prev) => [
        {
          id: order.id,
          code: order.code,
          status: order.status,
          scannedAt: new Date(),
          cancelReason: order.cancelReason,
          packagingWarning: order.packagingWarning,
          printCount: order.printCount,
        },
        ...prev,
      ]);
      return true;
    },
    [hasOrder]
  );

  const removeOrder = useCallback((code: string) => {
    setScannedOrders((prev) =>
      prev.filter((order) => order.code.toLowerCase() !== code.toLowerCase())
    );
  }, []);

  const clearOrders = useCallback(() => {
    setScannedOrders([]);
    setSearchQuery('');
  }, []);

  const [forcedActionableIds, setForcedActionableIds] = useState<Set<number>>(new Set());

  const ACTIONABLE_STATUSES = ['CONFIRMED', 'WAITING_FOR_PACKAGING'];

  const isActionableStatus = (status: string) =>
    ACTIONABLE_STATUSES.includes(status);

  const isActionable = useCallback(
    (order: ScannedOrder) =>
      forcedActionableIds.has(order.id) ||
      (isActionableStatus(order.status) && !order.packagingWarning),
    [forcedActionableIds]
  );

  const forceActionable = useCallback((orderId: number) => {
    setForcedActionableIds((prev) => new Set(prev).add(orderId));
  }, []);

  const confirmedOrders = useMemo(
    () => scannedOrders.filter((o) => o.status === 'CONFIRMED' && !o.packagingWarning),
    [scannedOrders]
  );

  const actionableOrders = useMemo(
    () => scannedOrders.filter(isActionable),
    [scannedOrders, isActionable]
  );

  const actionableGroups: NonConfirmedGroup[] = useMemo(() => {
    const actionable = scannedOrders.filter(isActionable);
    if (actionable.length === 0) return [];
    const grouped = groupBy(actionable, 'status');
    const statuses = Object.keys(grouped);
    return statuses.map((status) => ({ status, orders: grouped[status] }));
  }, [scannedOrders, isActionable]);

  const nonConfirmedGroups: NonConfirmedGroup[] = useMemo(() => {
    const nonConfirmed = scannedOrders.filter((o) => !isActionable(o));
    if (nonConfirmed.length === 0) return [];
    const grouped = groupBy(nonConfirmed, 'status');
    return Object.entries(grouped).map(([status, orders]) => ({
      status,
      orders,
    }));
  }, [scannedOrders, isActionable]);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) {
      return scannedOrders;
    }
    const query = searchQuery.toLowerCase();
    return scannedOrders.filter((order) =>
      order.code.toLowerCase().includes(query)
    );
  }, [scannedOrders, searchQuery]);

  const confirmedFilteredOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === 'CONFIRMED' && !o.packagingWarning),
    [filteredOrders]
  );

  const actionableFilteredOrders = useMemo(
    () => filteredOrders.filter(isActionable),
    [filteredOrders, isActionable]
  );

  const actionableFilteredGroups: NonConfirmedGroup[] = useMemo(() => {
    const actionable = filteredOrders.filter(isActionable);
    if (actionable.length === 0) return [];
    const grouped = groupBy(actionable, 'status');
    const statuses = Object.keys(grouped);
    return statuses.map((status) => ({ status, orders: grouped[status] }));
  }, [filteredOrders, isActionable]);

  return {
    scannedOrders,
    confirmedOrders,
    actionableOrders,
    actionableGroups,
    nonConfirmedGroups,
    addOrder,
    removeOrder,
    clearOrders,
    hasOrder,
    searchQuery,
    setSearchQuery,
    filteredOrders,
    confirmedFilteredOrders,
    actionableFilteredOrders,
    actionableFilteredGroups,
    forceActionable,
  };
}
