'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import type { ChangeCompanyRow } from '../types/bulkCompanySwitch';
import {
  EMPTY_PICKS,
  isSameOrder,
  newRowOf,
  type PickOption,
} from '../utils/switchRows';

export function useChangeCompanyRows() {
  const [rows, setRows] = useState<ChangeCompanyRow[]>([]);
  const [targetId, setTargetId] = useState<number | null>(null);
  const targetRef = useRef<number | null>(null);
  const rowsRef = useRef<ChangeCompanyRow[]>(rows);
  rowsRef.current = rows;

  const hasCode = useCallback(
    (code: string) => rowsRef.current.some((row) => row.order.code === code),
    []
  );

  const addScannedOrder = useCallback((order: Order): boolean => {
    if (rowsRef.current.some((row) => isSameOrder(row, order))) {
      toast.warning(CHANGE_COMPANY_TEXT.duplicateScan);
      return false;
    }
    setRows((prev) =>
      prev.some((row) => isSameOrder(row, order)) ? prev : [...prev, newRowOf(order)]
    );
    return true;
  }, []);

  const setTarget = useCallback((nextTargetId: number | null) => {
    if (targetRef.current === nextTargetId) return;
    targetRef.current = nextTargetId;
    setTargetId(nextTargetId);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        picks: EMPTY_PICKS,
        prefillTargetId: null,
        cityPrefillKey: null,
      }))
    );
  }, []);

  const patchRow = useCallback((orderId: number, patch: Partial<ChangeCompanyRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.order.id === orderId ? { ...row, ...patch } : row))
    );
  }, []);

  const pickGovernorate = useCallback((orderId: number, option: PickOption | null) => {
    patchRow(orderId, {
      picks: {
        governorateOption: option?.value ?? null,
        governorateName: option?.label ?? null,
        cityOption: null,
        cityName: null,
      },
    });
  }, [patchRow]);

  const pickCity = useCallback((orderId: number, option: PickOption | null) => {
    setRows((prev) =>
      prev.map((row) =>
        row.order.id === orderId
          ? {
              ...row,
              picks: {
                ...row.picks,
                cityOption: option?.value ?? null,
                cityName: option?.label ?? null,
              },
            }
          : row
      )
    );
  }, []);

  const clearAll = useCallback(() => setRows([]), []);

  return {
    rows,
    targetId,
    setTarget,
    addScannedOrder,
    hasCode,
    patchRow,
    pickGovernorate,
    pickCity,
    clearAll,
  };
}
