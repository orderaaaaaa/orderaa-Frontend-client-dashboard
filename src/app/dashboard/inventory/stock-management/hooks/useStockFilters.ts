'use client';

import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { MOCK_PRODUCTS, LOW_STOCK_THRESHOLD } from '../constants';
import type { StockFilters, StockProduct } from '../types';

const INITIAL_FILTERS: StockFilters = {
  searchQuery: '',
  color: '',
  size: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

export function useStockFilters() {
  const [filters, setFilters] = useState<StockFilters>(INITIAL_FILTERS);
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof StockFilters>(key: K, value: StockFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const clearFilter = useCallback((key: keyof StockFilters) => {
    setFilters((prev) => ({ ...prev, [key]: INITIAL_FILTERS[key] }));
  }, []);

  const setFromDate = useCallback((date: Date | null) => {
    setFilters((prev) => ({ ...prev, fromDate: date, timePeriod: '' }));
  }, []);

  const setToDate = useCallback((date: Date | null) => {
    setFilters((prev) => ({ ...prev, toDate: date, timePeriod: '' }));
  }, []);

  const setTimePeriod = useCallback((period: TimePeriod | '') => {
    if (!period) {
      setFilters((prev) => ({ ...prev, timePeriod: '', fromDate: null, toDate: null }));
      return;
    }
    const range = calculateDateRangeFromPeriod(period);
    setFilters((prev) => ({
      ...prev,
      timePeriod: period,
      fromDate: range?.from ?? null,
      toDate: range?.to ?? null,
    }));
  }, []);

  const filteredProducts: StockProduct[] = useMemo(() => {
    let products = MOCK_PRODUCTS;

    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    if (filters.color) {
      products = products.filter((p) => p.colors.includes(filters.color));
    }

    if (filters.size) {
      products = products.filter((p) => p.sizes.includes(filters.size));
    }

    return products;
  }, [debouncedSearchQuery, filters.color, filters.size]);

  const totalProducts = filteredProducts.length;

  const totalQuantity = useMemo(
    () =>
      filteredProducts.reduce(
        (sum, product) =>
          sum +
          product.variants.reduce(
            (vSum, variant) =>
              vSum +
              Object.values(variant.stocks).reduce(
                (sSum, stock) => sSum + stock.quantity,
                0
              ),
            0
          ),
        0
      ),
    [filteredProducts]
  );

  const lowStockCount = useMemo(
    () =>
      filteredProducts.reduce(
        (count, product) =>
          count +
          product.variants.reduce(
            (vCount, variant) =>
              vCount +
              Object.values(variant.stocks).filter(
                (s) =>
                  s.quantity > 0 && s.quantity < LOW_STOCK_THRESHOLD
              ).length,
            0
          ),
        0
      ),
    [filteredProducts]
  );

  const hasActiveFilters =
    !!debouncedSearchQuery.trim() ||
    !!filters.color ||
    !!filters.size ||
    !!filters.fromDate ||
    !!filters.toDate;

  return {
    filters,
    filteredProducts,
    totalProducts,
    totalQuantity,
    lowStockCount,
    hasActiveFilters,
    setSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  };
}
