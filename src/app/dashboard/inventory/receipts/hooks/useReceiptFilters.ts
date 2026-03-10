import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { MOCK_RECEIPTS } from '../constants';
import { ReceiptFilters } from '../types';

const INITIAL_FILTERS: ReceiptFilters = {
  searchQuery: '',
  supplierName: '',
  itemsCount: '',
  employeeName: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

export function useReceiptFilters() {
  const [filters, setFilters] = useState<ReceiptFilters>(INITIAL_FILTERS);

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearSearchQuery = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof ReceiptFilters>(key: K, value: ReceiptFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilter = useCallback((key: keyof ReceiptFilters) => {
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'fromDate' || key === 'toDate' ? null : '',
    }));
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
      fromDate: range?.from || null,
      toDate: range?.to || null,
    }));
  }, []);

  const filteredReceipts = useMemo(() => {
    return MOCK_RECEIPTS.filter((receipt) => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          receipt.invoiceNumber.toLowerCase().includes(query) ||
          receipt.companyName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.supplierName && receipt.companyName !== filters.supplierName) {
        return false;
      }

      if (filters.itemsCount) {
        const count = parseInt(filters.itemsCount, 10);
        if (!isNaN(count) && receipt.itemsCount !== count) {
          return false;
        }
      }

      if (filters.employeeName && receipt.employeeName !== filters.employeeName) {
        return false;
      }

      if (filters.fromDate || filters.toDate) {
        const receiptDate = new Date(receipt.createdAt);
        if (filters.fromDate && receiptDate < filters.fromDate) return false;
        if (filters.toDate && receiptDate > filters.toDate) return false;
      }

      return true;
    });
  }, [debouncedSearchQuery, filters]);

  const hasActiveFilters = useMemo(
    () =>
      !!debouncedSearchQuery ||
      !!filters.supplierName ||
      !!filters.itemsCount ||
      !!filters.employeeName ||
      !!filters.fromDate ||
      !!filters.toDate,
    [debouncedSearchQuery, filters],
  );

  return {
    filters,
    filteredReceipts,
    hasActiveFilters,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  };
}
