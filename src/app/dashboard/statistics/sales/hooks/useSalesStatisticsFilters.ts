import { useCallback, useMemo, useState } from 'react';
import { formatDateToLocalDate, calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import type { SalesStatisticsParams, SalesSubPageSet } from '../types';

export interface SalesStatisticsFiltersState {
  fromDate: Date | null;
  toDate: Date | null;
  timePeriod: TimePeriod | '';
  storeIds: string[];
  carrierKeys: string[];
  pageNames: string[];
  approvedOnly: boolean;
}

export interface UseSalesStatisticsFiltersResult extends SalesStatisticsFiltersState {
  params: SalesStatisticsParams | null;
  selectionCount: number;
  setFromDate: (date: Date | null) => void;
  setToDate: (date: Date | null) => void;
  setTimePeriod: (period: TimePeriod | '') => void;
  setStoreIds: (values: string[]) => void;
  setCarrierKeys: (values: string[]) => void;
  setPageNames: (values: string[]) => void;
  setApprovedOnly: (value: boolean) => void;
  clearScope: () => void;
}

function firstDayOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function buildInitialState(): SalesStatisticsFiltersState {
  return {
    fromDate: firstDayOfCurrentMonth(),
    toDate: new Date(),
    timePeriod: '',
    storeIds: [],
    carrierKeys: [],
    pageNames: [],
    approvedOnly: true,
  };
}

export function buildSalesParams(
  state: Pick<
    SalesStatisticsFiltersState,
    'fromDate' | 'toDate' | 'storeIds' | 'carrierKeys' | 'pageNames' | 'approvedOnly'
  >,
): SalesStatisticsParams | null {
  const from = formatDateToLocalDate(state.fromDate);
  const to = formatDateToLocalDate(state.toDate);
  if (!from || !to) return null;

  const params: SalesStatisticsParams = { from, to, approvedOnly: state.approvedOnly };
  if (state.storeIds.length) params.storeIds = state.storeIds.map(Number);
  if (state.carrierKeys.length) params.carrierKeys = state.carrierKeys;
  if (state.pageNames.length) params.pageNames = state.pageNames;
  return params;
}

type SearchParamValue = string | string[] | undefined;

const SALES_SUB_PAGE_BASE_PATH = '/dashboard/statistics/sales';
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function buildSalesSubPageHref(
  set: SalesSubPageSet,
  params: SalesStatisticsParams | null,
): string {
  const base = `${SALES_SUB_PAGE_BASE_PATH}/${set}`;
  if (!params) return base;

  const search = new URLSearchParams();
  search.set('from', params.from);
  search.set('to', params.to);
  search.set('approvedOnly', String(params.approvedOnly));
  params.storeIds?.forEach((id) => search.append('storeIds', String(id)));
  params.carrierKeys?.forEach((key) => search.append('carrierKeys', key));
  params.pageNames?.forEach((name) => search.append('pageNames', name));
  return `${base}?${search.toString()}`;
}

function readFirst(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function readList(value: SearchParamValue): string[] {
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).filter((item) => item !== '');
}

function parseIsoDate(value: string | undefined): Date | null {
  if (!value || !ISO_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return formatDateToLocalDate(date) === value ? date : null;
}

export function parseSalesSearchParams(
  searchParams: Record<string, SearchParamValue>,
): Partial<SalesStatisticsFiltersState> {
  const result: Partial<SalesStatisticsFiltersState> = {
    storeIds: readList(searchParams.storeIds),
    carrierKeys: readList(searchParams.carrierKeys),
    pageNames: readList(searchParams.pageNames),
  };

  const fromDate = parseIsoDate(readFirst(searchParams.from));
  const toDate = parseIsoDate(readFirst(searchParams.to));
  if (fromDate && toDate) {
    result.fromDate = fromDate;
    result.toDate = toDate;
  }

  const approvedOnly = readFirst(searchParams.approvedOnly);
  if (approvedOnly === 'true' || approvedOnly === 'false') {
    result.approvedOnly = approvedOnly === 'true';
  }

  return result;
}

export function useSalesStatisticsFilters(
  initial?: Partial<SalesStatisticsFiltersState>,
): UseSalesStatisticsFiltersResult {
  const [state, setState] = useState<SalesStatisticsFiltersState>(() => ({
    ...buildInitialState(),
    ...initial,
  }));

  const setFromDate = useCallback((date: Date | null) => {
    setState((prev) => ({ ...prev, fromDate: date, timePeriod: '' }));
  }, []);

  const setToDate = useCallback((date: Date | null) => {
    setState((prev) => ({ ...prev, toDate: date, timePeriod: '' }));
  }, []);

  const setTimePeriod = useCallback((period: TimePeriod | '') => {
    if (!period) {
      setState((prev) => ({ ...prev, timePeriod: '' }));
      return;
    }
    const range = calculateDateRangeFromPeriod(period);
    setState((prev) => ({
      ...prev,
      timePeriod: period,
      fromDate: range?.from ?? prev.fromDate,
      toDate: range?.to ?? prev.toDate,
    }));
  }, []);

  const setStoreIds = useCallback((values: string[]) => {
    setState((prev) => ({ ...prev, storeIds: values }));
  }, []);

  const setCarrierKeys = useCallback((values: string[]) => {
    setState((prev) => ({ ...prev, carrierKeys: values }));
  }, []);

  const setPageNames = useCallback((values: string[]) => {
    setState((prev) => ({ ...prev, pageNames: values }));
  }, []);

  const setApprovedOnly = useCallback((value: boolean) => {
    setState((prev) => ({ ...prev, approvedOnly: value }));
  }, []);

  const clearScope = useCallback(() => {
    setState((prev) => ({ ...prev, storeIds: [], carrierKeys: [], pageNames: [] }));
  }, []);

  const params = useMemo(() => buildSalesParams(state), [state]);

  const selectionCount = state.storeIds.length + state.carrierKeys.length + state.pageNames.length;

  return {
    ...state,
    params,
    selectionCount,
    setFromDate,
    setToDate,
    setTimePeriod,
    setStoreIds,
    setCarrierKeys,
    setPageNames,
    setApprovedOnly,
    clearScope,
  };
}
