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

  const ACTIONABLE_STATUSES = ['CONFIRMED', 'WAITING_FOR_PACKAGING'];

  const isActionableStatus = (status: string) =>
    ACTIONABLE_STATUSES.includes(status);

  const confirmedOrders = useMemo(
    () => scannedOrders.filter((o) => o.status === 'CONFIRMED' && !o.packagingWarning),
    [scannedOrders]
  );

  const actionableOrders = useMemo(
    () => scannedOrders.filter((o) => isActionableStatus(o.status) && !o.packagingWarning),
    [scannedOrders]
  );

  const actionableGroups: NonConfirmedGroup[] = useMemo(() => {
    const actionable = scannedOrders.filter(
      (o) => isActionableStatus(o.status) && !o.packagingWarning
    );
    if (actionable.length === 0) return [];
    const grouped = groupBy(actionable, 'status');
    return ACTIONABLE_STATUSES
      .filter((status) => grouped[status])
      .map((status) => ({ status, orders: grouped[status] }));
  }, [scannedOrders]);

  const nonConfirmedGroups: NonConfirmedGroup[] = useMemo(() => {
    const nonConfirmed = scannedOrders.filter(
      (o) => !isActionableStatus(o.status) || !!o.packagingWarning
    );
    if (nonConfirmed.length === 0) return [];
    const grouped = groupBy(nonConfirmed, 'status');
    return Object.entries(grouped).map(([status, orders]) => ({
      status,
      orders,
    }));
  }, [scannedOrders]);

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
    () => filteredOrders.filter((o) => isActionableStatus(o.status) && !o.packagingWarning),
    [filteredOrders]
  );

  const actionableFilteredGroups: NonConfirmedGroup[] = useMemo(() => {
    const actionable = filteredOrders.filter(
      (o) => isActionableStatus(o.status) && !o.packagingWarning
    );
    if (actionable.length === 0) return [];
    const grouped = groupBy(actionable, 'status');
    return ACTIONABLE_STATUSES
      .filter((status) => grouped[status])
      .map((status) => ({ status, orders: grouped[status] }));
  }, [filteredOrders]);

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
  };
}
