import { useCallback, useMemo, useState } from 'react';
import { formatDateToLocalDate, calculateDateRangeFromPeriod, TimePeriod } from '@/utils/dateRangeUtils';
import type { SalesStatisticsParams } from '../types';

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

export function useSalesStatisticsFilters(): UseSalesStatisticsFiltersResult {
  const [state, setState] = useState<SalesStatisticsFiltersState>(buildInitialState);

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
