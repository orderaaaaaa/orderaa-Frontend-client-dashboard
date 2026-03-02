import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { MOCK_SUPPLIERS } from '../constants';
import { SupplierFilters } from '../types';

const INITIAL_FILTERS: SupplierFilters = {
  searchQuery: '',
  supplierName: '',
  purchases: '',
  remainingAmount: '',
  paidAmount: '',
  invoicesCount: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

export function useSupplierFilters() {
  const [filters, setFilters] = useState<SupplierFilters>(INITIAL_FILTERS);

  const debouncedSearchQuery = useDebounce(filters.searchQuery, 300);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const clearSearchQuery = useCallback(() => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof SupplierFilters>(key: K, value: SupplierFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilter = useCallback((key: keyof SupplierFilters) => {
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

  const filteredSuppliers = useMemo(() => {
    return MOCK_SUPPLIERS.filter((supplier) => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          supplier.name.toLowerCase().includes(query) ||
          supplier.contactPerson.toLowerCase().includes(query) ||
          supplier.phone.includes(query) ||
          supplier.email.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.supplierName && supplier.name !== filters.supplierName) {
        return false;
      }

      if (filters.remainingAmount) {
        if (filters.remainingAmount === 'مدين' && supplier.remainingAmount >= 0) return false;
        if (filters.remainingAmount === 'دائن' && supplier.remainingAmount <= 0) return false;
        if (filters.remainingAmount === 'لا يوجد' && supplier.remainingAmount !== 0) return false;
      }

      if (filters.paidAmount) {
        const [min, max] = filters.paidAmount.includes('+')
          ? [parseFloat(filters.paidAmount), Infinity]
          : filters.paidAmount.split('-').map(Number);
        if (supplier.paidAmount < min || supplier.paidAmount > max) return false;
      }

      if (filters.invoicesCount) {
        const [min, max] = filters.invoicesCount.includes('+')
          ? [parseFloat(filters.invoicesCount), Infinity]
          : filters.invoicesCount.split('-').map(Number);
        if (supplier.invoicesCount < min || supplier.invoicesCount > max) return false;
      }

      return true;
    });
  }, [debouncedSearchQuery, filters]);

  const hasActiveFilters = useMemo(
    () =>
      !!debouncedSearchQuery ||
      !!filters.supplierName ||
      !!filters.purchases ||
      !!filters.remainingAmount ||
      !!filters.paidAmount ||
      !!filters.invoicesCount ||
      !!filters.fromDate ||
      !!filters.toDate,
    [debouncedSearchQuery, filters],
  );

  return {
    filters,
    filteredSuppliers,
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
