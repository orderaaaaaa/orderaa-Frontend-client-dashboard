'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import { switchOrderCompany, httpStatusOf, serverMessageOf } from '../services/bulkCompanySwitch';
import {
  BULK_COMPANY_SWITCH_OUTCOME,
  CHANGE_COMPANY_PHASE,
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyPhase,
  type ChangeCompanyRow,
} from '../types/bulkCompanySwitch';

type PatchRow = (orderId: number, patch: Partial<ChangeCompanyRow>) => void;

export function useChangeCompanyRun(patchRow: PatchRow) {
  const [phase, setPhase] = useState<ChangeCompanyPhase>(CHANGE_COMPANY_PHASE.IDLE);
  const runningRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (rows: ChangeCompanyRow[], shippingCompanyId: number): Promise<number[]> => {
      if (runningRef.current) return [];
      runningRef.current = true;
      setPhase(CHANGE_COMPANY_PHASE.RUNNING);
      const printableIds: number[] = [];
      try {
        for (const row of rows) {
          if (!mountedRef.current) break;
          const { governorateOption, cityOption } = row.picks;
          if (governorateOption === null || cityOption === null) continue;
          const orderId = row.order.id;
          patchRow(orderId, { status: CHANGE_COMPANY_ROW_STATUS.SENDING, errorMessage: null });
          try {
            const response = await switchOrderCompany(orderId, {
              shippingCompanyId,
              governorateOption,
              cityOption,
            });
            if (!mountedRef.current) break;
            patchRow(orderId, {
              status: CHANGE_COMPANY_ROW_STATUS.DONE,
              result: response,
              errorMessage: null,
            });
            if (
              response.outcome === BULK_COMPANY_SWITCH_OUTCOME.SWITCHED ||
              response.outcome === BULK_COMPANY_SWITCH_OUTCOME.UPDATED
            ) {
              printableIds.push(orderId);
            }
          } catch (error: unknown) {
            if (!mountedRef.current) break;
            const status = httpStatusOf(error);
            if (status === 404) {
              patchRow(orderId, {
                status: CHANGE_COMPANY_ROW_STATUS.SKIPPED,
                errorMessage: CHANGE_COMPANY_TEXT.notFound,
              });
            } else if (status === undefined || status >= 500) {
              patchRow(orderId, {
                status: CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN,
                errorMessage: null,
              });
            } else {
              patchRow(orderId, {
                status: CHANGE_COMPANY_ROW_STATUS.ERROR,
                errorMessage: serverMessageOf(error) ?? CHANGE_COMPANY_TEXT.errorRequest,
              });
            }
          }
        }
      } finally {
        runningRef.current = false;
        if (mountedRef.current) setPhase(CHANGE_COMPANY_PHASE.DONE);
      }
      return printableIds;
    },
    [patchRow]
  );

  const reset = useCallback(() => setPhase(CHANGE_COMPANY_PHASE.IDLE), []);

  return { phase, run, reset, isRunning: phase === CHANGE_COMPANY_PHASE.RUNNING };
}
