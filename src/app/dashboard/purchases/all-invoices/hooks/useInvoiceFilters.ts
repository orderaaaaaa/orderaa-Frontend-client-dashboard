import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { MOCK_INVOICES } from '../constants';
import { InvoiceFilters } from '../types';

const INITIAL_FILTERS: InvoiceFilters = {
  searchQuery: '',
  supplierName: '',
  transactionType: '',
  totalAmount: '',
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

  const filteredInvoices = useMemo(() => {
    return MOCK_INVOICES.filter((invoice) => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          invoice.invoiceNumber.toLowerCase().includes(query) ||
          invoice.companyName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.supplierName && invoice.companyName !== filters.supplierName) {
        return false;
      }

      if (filters.transactionType && invoice.transactionType !== filters.transactionType) {
        return false;
      }

      if (filters.totalAmount) {
        const amount = parseFloat(filters.totalAmount);
        if (!isNaN(amount) && invoice.totalAmount !== amount) {
          return false;
        }
      }

      if (filters.fromDate || filters.toDate) {
        const invoiceDate = new Date(invoice.createdAt);
        if (filters.fromDate && invoiceDate < filters.fromDate) return false;
        if (filters.toDate && invoiceDate > filters.toDate) return false;
      }

      if (filters.employeeName && invoice.employeeName !== filters.employeeName) {
        return false;
      }

      return true;
    });
  }, [debouncedSearchQuery, filters]);

  const hasActiveFilters = useMemo(
    () =>
      !!debouncedSearchQuery ||
      !!filters.supplierName ||
      !!filters.transactionType ||
      !!filters.totalAmount ||
      !!filters.employeeName ||
      !!filters.fromDate ||
      !!filters.toDate,
    [debouncedSearchQuery, filters],
  );

  return {
    filters,
    filteredInvoices,
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
