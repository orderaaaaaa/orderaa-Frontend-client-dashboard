'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/utils/debounce';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import {
  useStockProducts,
  useStockFilterOptions,
  type StockFiltersDto,
} from '@/services/stock';
import { apiListToStockProducts } from '../utils/transformStock';
import { STOCK_SCOPE_KINDS } from '../constants';
import type { StockFilters, StockProduct, StockScope } from '../types';

const INITIAL_FILTERS: StockFilters = {
  searchQuery: '',
  color: '',
  size: '',
  fromDate: null,
  toDate: null,
  timePeriod: '',
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function dateToIsoOrUndefined(date: Date | null): string | undefined {
  if (!date) return undefined;
  return date.toISOString();
}

function endOfDayIsoOrUndefined(date: Date | null): string | undefined {
  if (!date) return undefined;
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

export function useStockFilters(scope: StockScope) {
  const [filters, setFilters] = useState<StockFilters>(INITIAL_FILTERS);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const scopeKind = scope.kind;
  const scopeId = scope.id;
  const canReadVirtual = useHasPermission(
    PERMISSION_CODES.VIRTUAL_WAREHOUSES_READ
  );
  const isScopeReadable =
    scopeKind !== STOCK_SCOPE_KINDS.VIRTUAL || canReadVirtual;
  const [page, setPage] = useState<number>(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

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
      setFilters((prev) => ({
        ...prev,
        timePeriod: '',
        fromDate: null,
        toDate: null,
      }));
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

  const filterDtoBase = useMemo<Omit<StockFiltersDto, 'page' | 'limit'>>(
    () => ({
      search: debouncedSearchQuery.trim() || undefined,
      color: filters.color || undefined,
      size: filters.size || undefined,
      warehouseId:
        scopeKind === STOCK_SCOPE_KINDS.PHYSICAL ? String(scopeId) : undefined,
      virtualWarehouseId:
        scopeKind === STOCK_SCOPE_KINDS.VIRTUAL ? String(scopeId) : undefined,
      outOfStockOnly: outOfStockOnly || undefined,
      fromDate: dateToIsoOrUndefined(filters.fromDate),
      toDate: endOfDayIsoOrUndefined(filters.toDate),
    }),
    [
      debouncedSearchQuery,
      filters.color,
      filters.size,
      filters.fromDate,
      filters.toDate,
      scopeKind,
      scopeId,
      outOfStockOnly,
    ]
  );

  const isFirstFilterRender = useRef(true);
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    setPage(DEFAULT_PAGE);
  }, [filterDtoBase]);

  const productsQuery = useStockProducts(
    {
      ...filterDtoBase,
      page,
      limit: pageSize,
    },
    { enabled: isScopeReadable }
  );

  const filterOptionsQuery = useStockFilterOptions();

  const filteredProducts: StockProduct[] = useMemo(() => {
    if (!productsQuery.data) return [];
    return apiListToStockProducts(productsQuery.data.data, {
      onlyReturnedVariants: filterDtoBase.outOfStockOnly === true,
    });
  }, [productsQuery.data, filterDtoBase.outOfStockOnly]);

  const hasActiveFilters =
    !!debouncedSearchQuery.trim() ||
    !!filters.color ||
    !!filters.size ||
    outOfStockOnly ||
    !!filters.fromDate ||
    !!filters.toDate;

  return {
    filters,
    filteredProducts,
    hasActiveFilters,
    setSearchQuery,
    setFilter,
    clearFilter,
    setFromDate,
    setToDate,
    setTimePeriod,
    outOfStockOnly,
    setOutOfStockOnly,

    page,
    pageSize,
    setPage,
    setPageSize,
    currentPage: productsQuery.data?.currentPage ?? page,
    totalPages: productsQuery.data?.totalPages ?? 0,
    totalItems: productsQuery.data?.totalItems ?? 0,
    hasNextPage: productsQuery.data?.hasNextPage ?? false,
    hasPreviousPage: productsQuery.data?.hasPreviousPage ?? false,

    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    isError: productsQuery.isError,
    error: productsQuery.error,
    productsError: productsQuery.error,

    colorOptions: filterOptionsQuery.data?.colors ?? [],
    sizeOptions: filterOptionsQuery.data?.sizes ?? [],

    filterDtoBase,
  };
}
