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

const isDev = process.env.NODE_ENV === 'development';

function log(...args: any[]) {
  if (isDev) {
    console.log('[Scanned Orders]', ...args);
  }
}

export function useScannedOrders(): UseScannedOrdersReturn {
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const hasOrder = useCallback(
    (code: string) => {
      const exists = scannedOrders.some(
        (order) => order.code.toLowerCase() === code.toLowerCase()
      );
      log('Checking if order exists:', code, 'result:', exists);
      return exists;
    },
    [scannedOrders]
  );

  const addOrder = useCallback(
    (code: string): boolean => {
      log('addOrder called with code:', code);
      log('Current orders count:', scannedOrders.length);

      if (hasOrder(code)) {
        log('Order already exists, not adding:', code);
        return false;
      }

      log('Adding new order:', code);
      setScannedOrders((prev) => {
        const newOrders = [{ code, scannedAt: new Date() }, ...prev];
        log('Orders list updated, new count:', newOrders.length);
        return newOrders;
      });
      return true;
    },
    [hasOrder, scannedOrders.length]
  );

  const removeOrder = useCallback((code: string) => {
    log('removeOrder called with code:', code);
    setScannedOrders((prev) => {
      const filtered = prev.filter(
        (order) => order.code.toLowerCase() !== code.toLowerCase()
      );
      log('Order removed, new count:', filtered.length);
      return filtered;
    });
  }, []);

  const clearOrders = useCallback(() => {
    log('clearOrders called, clearing all orders');
    setScannedOrders([]);
    setSearchQuery('');
    log('All orders cleared');
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) {
      return scannedOrders;
    }
    const query = searchQuery.toLowerCase();
    const filtered = scannedOrders.filter((order) =>
      order.code.toLowerCase().includes(query)
    );
    log('Filtering orders with query:', searchQuery, 'results:', filtered.length);
    return filtered;
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
