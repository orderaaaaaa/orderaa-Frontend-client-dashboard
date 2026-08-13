'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  calculateDateRangeFromPeriod,
  TimePeriod,
} from '@/utils/dateRangeUtils';
import { useStockMovementsQuery } from '@/services/warehouses';
import type {
  GetStockMovementsParams,
  StockMovementSource,
} from '@/lib/api/warehouses';

export interface MovementsFiltersState {
  source: string;
  warehouseId: string;
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: TimePeriod | '';
}

const INITIAL_FILTERS: MovementsFiltersState = {
  source: '',
  warehouseId: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

const DEFAULT_PAGE_SIZE = 25;

function dateToIsoOrUndefined(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString();
}

export function useMovementsFilters() {
  const [filters, setFilters] =
    useState<MovementsFiltersState>(INITIAL_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Filter setters reset the page synchronously — resetting via an effect
  // fired one render later, issuing a wasted request for the stale page.
  const setSource = useCallback((source: string) => {
    setFilters((prev) => ({ ...prev, source }));
    setCurrentPage(1);
  }, []);

  const setWarehouseId = useCallback((warehouseId: string) => {
    setFilters((prev) => ({ ...prev, warehouseId }));
    setCurrentPage(1);
  }, []);

  const setFromDate = useCallback((date: Date | null) => {
    setFilters((prev) => ({ ...prev, fromDate: date, timePeriod: '' }));
    setCurrentPage(1);
  }, []);

  const setToDate = useCallback((date: Date | null) => {
    setFilters((prev) => ({ ...prev, toDate: date, timePeriod: '' }));
    setCurrentPage(1);
  }, []);

  const setTimePeriod = useCallback((period: TimePeriod | '') => {
    if (!period) {
      setFilters((prev) => ({
        ...prev,
        timePeriod: '',
        fromDate: null,
        toDate: null,
      }));
    } else {
      const range = calculateDateRangeFromPeriod(period);
      setFilters((prev) => ({
        ...prev,
        timePeriod: period,
        fromDate: range?.from ?? null,
        toDate: range?.to ?? null,
      }));
    }
    setCurrentPage(1);
  }, []);

  const queryParams = useMemo<GetStockMovementsParams>(
    () => ({
      page: currentPage,
      limit: pageSize,
      source: filters.source
        ? (filters.source as StockMovementSource)
        : undefined,
      warehouseId: filters.warehouseId
        ? Number(filters.warehouseId)
        : undefined,
      dateFrom: dateToIsoOrUndefined(filters.fromDate),
      dateTo: dateToIsoOrUndefined(filters.toDate),
    }),
    [currentPage, pageSize, filters]
  );

  const query = useStockMovementsQuery(queryParams);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    !!filters.source ||
    !!filters.warehouseId ||
    !!filters.fromDate ||
    !!filters.toDate;

  return {
    filters,
    setSource,
    setWarehouseId,
    setFromDate,
    setToDate,
    setTimePeriod,
    resetFilters,
    hasActiveFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    handlePageSizeChange,
    query,
  };
}
