'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import {
  BULK_COMPANY_SWITCH_OUTCOME,
  BULK_COMPANY_SWITCH_REASON,
  CHANGE_COMPANY_ROW_STATUS,
  type BulkCompanySwitchReason,
  type ChangeCompanyPicks,
  type ChangeCompanyRow,
  type ChangeCompanySnapshot,
} from '../types/bulkCompanySwitch';

export const CHANGE_COMPANY_SENDABLE_STATUSES: readonly string[] = [
  'CONFIRMED',
  'WAITING_FOR_PACKAGING',
  'PREPARED',
];

export interface ClientCheckContext {
  targetId: number | null;
  targetActive: boolean;
  callerEmployeeId: number | null;
  canBypassLock: boolean;
}

export interface PickOption {
  value: string;
  label: string;
}

const EMPTY_PICKS: ChangeCompanyPicks = {
  governorateOption: null,
  governorateName: null,
  cityOption: null,
  cityName: null,
};

export function snapshotOf(order: Order): ChangeCompanySnapshot {
  return {
    companyId: order.shippingCompanyRef?.id ?? null,
    companyName: order.shippingCompanyRef?.name ?? null,
  };
}

export function newRowOf(order: Order): ChangeCompanyRow {
  return {
    order,
    snapshot: snapshotOf(order),
    status: CHANGE_COMPANY_ROW_STATUS.READY,
    picks: EMPTY_PICKS,
    localReason: null,
    result: null,
    errorMessage: null,
    prefillTargetId: null,
    cityPrefillKey: null,
  };
}

export function isSameOrder(row: ChangeCompanyRow, order: Order): boolean {
  return row.order.id === order.id || row.order.code === order.code;
}

export function localReasonOf(
  row: ChangeCompanyRow,
  context: ClientCheckContext
): BulkCompanySwitchReason | null {
  const { order, picks } = row;
  if (!CHANGE_COMPANY_SENDABLE_STATUSES.includes(order.status)) {
    return BULK_COMPANY_SWITCH_REASON.STATUS_NOT_ALLOWED;
  }
  const phone = order.customers.phone_numbers[0];
  if (!phone || phone.trim() === '') {
    return BULK_COMPANY_SWITCH_REASON.PHONE_MISSING;
  }
  if (picks.governorateOption === null || picks.cityOption === null) {
    return BULK_COMPANY_SWITCH_REASON.LOCATION_MISSING;
  }
  if (order.isShadowed) {
    return BULK_COMPANY_SWITCH_REASON.SHADOWED;
  }
  if (order.parkedAt) {
    return BULK_COMPANY_SWITCH_REASON.PARKED;
  }
  if (
    context.callerEmployeeId !== null &&
    order.lockedById != null &&
    order.lockedById !== context.callerEmployeeId &&
    !context.canBypassLock
  ) {
    return BULK_COMPANY_SWITCH_REASON.LOCKED_BY_OTHER;
  }
  if (context.targetId !== null && !context.targetActive) {
    return BULK_COMPANY_SWITCH_REASON.TARGET_NOT_ACTIVE;
  }
  return null;
}

export function applyClientChecks(
  rows: ChangeCompanyRow[],
  context: ClientCheckContext
): ChangeCompanyRow[] {
  return rows.map((row) => {
    if (
      row.status !== CHANGE_COMPANY_ROW_STATUS.READY &&
      row.status !== CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL
    ) {
      return row;
    }
    const localReason = localReasonOf(row, context);
    const status = localReason
      ? CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL
      : CHANGE_COMPANY_ROW_STATUS.READY;
    if (status === row.status && localReason === row.localReason) return row;
    return { ...row, status, localReason };
  });
}

export function isCancelListRow(row: ChangeCompanyRow): boolean {
  return (
    row.status === CHANGE_COMPANY_ROW_STATUS.DONE &&
    row.result?.outcome === BULK_COMPANY_SWITCH_OUTCOME.SWITCHED &&
    row.result.cancelAtPreviousCarrier
  );
}

export function needsClearConfirm(rows: ChangeCompanyRow[]): boolean {
  return rows.some(isCancelListRow);
}

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
