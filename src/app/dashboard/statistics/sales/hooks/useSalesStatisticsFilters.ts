import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { formatDateToLocalDate, calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import { isValidTimePeriod } from '@/utils/urlFilters';
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

type SalesFilterUpdate = (prev: SalesStatisticsFiltersState) => SalesStatisticsFiltersState;

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
  period: TimePeriod | '' = '',
): string {
  const base = `${SALES_SUB_PAGE_BASE_PATH}/${set}`;
  if (!params) return base;

  const search = new URLSearchParams();
  search.set('from', params.from);
  search.set('to', params.to);
  if (period) search.set('period', period);
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
  if (fromDate) result.fromDate = fromDate;

  const toDate = parseIsoDate(readFirst(searchParams.to));
  if (toDate) result.toDate = toDate;

  const approvedOnly = readFirst(searchParams.approvedOnly);
  if (approvedOnly === 'true' || approvedOnly === 'false') {
    result.approvedOnly = approvedOnly === 'true';
  }

  const period = readFirst(searchParams.period);
  if (period && isValidTimePeriod(period)) result.timePeriod = period;

  return result;
}

function toSearchRecord(searchParams: URLSearchParams): Record<string, string[]> {
  const record: Record<string, string[]> = {};
  searchParams.forEach((_, key) => {
    record[key] = searchParams.getAll(key);
  });
  return record;
}

export function parseSalesUrlState(searchParams: URLSearchParams): SalesStatisticsFiltersState {
  return { ...buildInitialState(), ...parseSalesSearchParams(toSearchRecord(searchParams)) };
}

export function serializeSalesUrlState(state: SalesStatisticsFiltersState): string {
  const search = new URLSearchParams();
  const from = formatDateToLocalDate(state.fromDate);
  const to = formatDateToLocalDate(state.toDate);
  if (from) search.set('from', from);
  if (to) search.set('to', to);
  if (state.timePeriod) search.set('period', state.timePeriod);
  search.set('approvedOnly', String(state.approvedOnly));
  state.storeIds.forEach((id) => search.append('storeIds', id));
  state.carrierKeys.forEach((key) => search.append('carrierKeys', key));
  state.pageNames.forEach((name) => search.append('pageNames', name));
  return search.toString();
}

function applyTimePeriod(
  prev: SalesStatisticsFiltersState,
  period: TimePeriod | '',
): SalesStatisticsFiltersState {
  if (!period) return { ...prev, timePeriod: '' };
  const range = calculateDateRangeFromPeriod(period);
  return {
    ...prev,
    timePeriod: period,
    fromDate: range?.from ?? prev.fromDate,
    toDate: range?.to ?? prev.toDate,
  };
}

function useSalesFilterActions(commit: (update: SalesFilterUpdate) => void) {
  const setFromDate = useCallback(
    (date: Date | null) => commit((prev) => ({ ...prev, fromDate: date, timePeriod: '' })),
    [commit],
  );

  const setToDate = useCallback(
    (date: Date | null) => commit((prev) => ({ ...prev, toDate: date, timePeriod: '' })),
    [commit],
  );

  const setTimePeriod = useCallback(
    (period: TimePeriod | '') => commit((prev) => applyTimePeriod(prev, period)),
    [commit],
  );

  const setStoreIds = useCallback(
    (values: string[]) => commit((prev) => ({ ...prev, storeIds: values })),
    [commit],
  );

  const setCarrierKeys = useCallback(
    (values: string[]) => commit((prev) => ({ ...prev, carrierKeys: values })),
    [commit],
  );

  const setPageNames = useCallback(
    (values: string[]) => commit((prev) => ({ ...prev, pageNames: values })),
    [commit],
  );

  const setApprovedOnly = useCallback(
    (value: boolean) => commit((prev) => ({ ...prev, approvedOnly: value })),
    [commit],
  );

  const clearScope = useCallback(
    () => commit((prev) => ({ ...prev, storeIds: [], carrierKeys: [], pageNames: [] })),
    [commit],
  );

  return {
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

function useSalesFilterResult(
  state: SalesStatisticsFiltersState,
  commit: (update: SalesFilterUpdate) => void,
): UseSalesStatisticsFiltersResult {
  const params = useMemo(() => buildSalesParams(state), [state]);
  const actions = useSalesFilterActions(commit);
  const selectionCount = state.storeIds.length + state.carrierKeys.length + state.pageNames.length;

  return {
    ...state,
    params,
    selectionCount,
    ...actions,
  };
}

export function useSalesStatisticsFilters(): UseSalesStatisticsFiltersResult {
  const [state, setState] = useState<SalesStatisticsFiltersState>(buildInitialState);
  const commit = useCallback((update: SalesFilterUpdate) => setState(update), []);
  return useSalesFilterResult(state, commit);
}

export function useSalesStatisticsUrlFilters(): UseSalesStatisticsFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseSalesUrlState(searchParams), [searchParams]);
  const commit = useCallback(
    (update: SalesFilterUpdate) => {
      router.push(`${pathname}?${serializeSalesUrlState(update(state))}`, { scroll: false });
    },
    [pathname, router, state],
  );
  return useSalesFilterResult(state, commit);
}
