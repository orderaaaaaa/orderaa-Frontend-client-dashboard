'use client';

import { useState, useCallback, useMemo } from 'react';

export interface ShippingScannedOrder {
  id: number;
  code: string;
  scannedAt: Date;
  shipmentPickupCode: string | null;
  pickupInvoice: string | null;
}

export interface AddShippingOrderInput {
  id: number;
  code: string;
  shipmentPickupCode: string | null;
  pickupInvoice: string | null;
}

export interface UseShippingScannedOrdersReturn {
  scannedOrders: ShippingScannedOrder[];
  addOrder: (order: AddShippingOrderInput) => boolean;
  removeOrder: (code: string) => void;
  clearOrders: () => void;
  hasOrder: (code: string) => boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredOrders: ShippingScannedOrder[];
}

export function useShippingScannedOrders(): UseShippingScannedOrdersReturn {
  const [scannedOrders, setScannedOrders] = useState<ShippingScannedOrder[]>([]);
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
    (order: AddShippingOrderInput): boolean => {
      if (hasOrder(order.code)) {
        return false;
      }

      setScannedOrders((prev) => [
        {
          id: order.id,
          code: order.code,
          scannedAt: new Date(),
          shipmentPickupCode: order.shipmentPickupCode,
          pickupInvoice: order.pickupInvoice,
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
