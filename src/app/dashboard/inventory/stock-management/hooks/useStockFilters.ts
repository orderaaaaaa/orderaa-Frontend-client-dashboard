'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '@/utils/debounce';
import { calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import {
  useStockAnalysis,
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
  warehouseId: '',
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

export function useStockFilters(scope: StockScope) {
  const [filters, setFilters] = useState<StockFilters>(INITIAL_FILTERS);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const scopeKind = scope.kind;
  const scopeId = scope.kind === STOCK_SCOPE_KINDS.ALL ? null : scope.id;
  const isAllScope = scopeKind === STOCK_SCOPE_KINDS.ALL;
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

  const setWarehouseId = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, warehouseId: value }));
  }, []);

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
        scopeKind === STOCK_SCOPE_KINDS.PHYSICAL
          ? String(scopeId)
          : scopeKind === STOCK_SCOPE_KINDS.ALL
            ? filters.warehouseId || undefined
            : undefined,
      virtualWarehouseId:
        scopeKind === STOCK_SCOPE_KINDS.VIRTUAL ? String(scopeId) : undefined,
      outOfStockOnly: outOfStockOnly || undefined,
      fromDate: dateToIsoOrUndefined(filters.fromDate),
      toDate: dateToIsoOrUndefined(filters.toDate),
    }),
    [
      debouncedSearchQuery,
      filters.color,
      filters.size,
      filters.warehouseId,
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

  const productsQuery = useStockProducts({
    ...filterDtoBase,
    page,
    limit: pageSize,
  });

  const analysisQuery = useStockAnalysis(
    {
      fromDate: filterDtoBase.fromDate,
      toDate: filterDtoBase.toDate,
    },
    { enabled: isAllScope }
  );

  const filterOptionsQuery = useStockFilterOptions();

  const filteredProducts: StockProduct[] = useMemo(() => {
    if (!productsQuery.data) return [];
    return apiListToStockProducts(productsQuery.data.data, {
      onlyReturnedVariants: filterDtoBase.outOfStockOnly === true,
    });
  }, [productsQuery.data, filterDtoBase.outOfStockOnly]);

  const totalProducts = analysisQuery.data?.totalProducts ?? 0;
  const totalQuantity = analysisQuery.data?.totalAvailableCount ?? 0;
  const lowStockCount = analysisQuery.data?.productsBelowMinStockCount ?? 0;

  const hasActiveFilters =
    !!debouncedSearchQuery.trim() ||
    !!filters.color ||
    !!filters.size ||
    (isAllScope && !!filters.warehouseId) ||
    outOfStockOnly ||
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
    setWarehouseId,
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
    isAnalysisLoading: isAllScope && analysisQuery.isLoading,
    isError: productsQuery.isError || (isAllScope && analysisQuery.isError),
    error: productsQuery.error || (isAllScope ? analysisQuery.error : null),
    productsError: productsQuery.error,

    colorOptions: filterOptionsQuery.data?.colors ?? [],
    sizeOptions: filterOptionsQuery.data?.sizes ?? [],

    filterDtoBase,
  };
}
