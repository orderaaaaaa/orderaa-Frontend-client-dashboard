import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { InvoiceFilters } from '../types';

const INITIAL_FILTERS: InvoiceFilters = {
  searchQuery: '',
  supplierName: '',
  transactionType: '',
  acceptanceStatus: '',
  totalAmountFrom: '',
  totalAmountTo: '',
  employeeName: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

export function useInvoiceFilters() {
  const [filters, setFilters] = useState<InvoiceFilters>(INITIAL_FILTERS);

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearSearchQuery = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof InvoiceFilters>(key: K, value: InvoiceFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilter = useCallback((key: keyof InvoiceFilters) => {
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

  const hasActiveFilters = useMemo(
    () =>
      !!debouncedSearchQuery ||
      !!filters.supplierName ||
      !!filters.transactionType ||
      !!filters.acceptanceStatus ||
      !!filters.totalAmountFrom ||
      !!filters.totalAmountTo ||
      !!filters.employeeName ||
      !!filters.fromDate ||
      !!filters.toDate,
    [debouncedSearchQuery, filters],
  );

  return {
    filters,
    hasActiveFilters,
    debouncedSearchQuery,
    setSearchQuery,
    clearSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
  };
}
