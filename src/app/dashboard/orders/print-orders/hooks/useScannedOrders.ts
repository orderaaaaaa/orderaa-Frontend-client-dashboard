'use client';

import { useState, useCallback, useMemo } from 'react';

export interface ScannedOrder {
  code: string;
  scannedAt: Date;
}

interface UseScannedOrdersReturn {
  scannedOrders: ScannedOrder[];
  addOrder: (code: string) => boolean;
  removeOrder: (code: string) => void;
  clearOrders: () => void;
  hasOrder: (code: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredOrders: ScannedOrder[];
}

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
    (code: string): boolean => {
      if (hasOrder(code)) {
        return false;
      }
      setScannedOrders((prev) => [
        { code, scannedAt: new Date() },
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

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) {
      return scannedOrders;
    }
    const query = searchQuery.toLowerCase();
    return scannedOrders.filter((order) =>
      order.code.toLowerCase().includes(query)
    );
  }, [scannedOrders, searchQuery]);

  return {
    scannedOrders,
    addOrder,
    removeOrder,
    clearOrders,
    hasOrder,
    searchQuery,
    setSearchQuery,
    filteredOrders,
  };
}
