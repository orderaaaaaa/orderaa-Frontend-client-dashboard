'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  LiaCheckSolid,
  LiaPrintSolid,
  LiaTimesSolid,
} from 'react-icons/lia';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils/apiError';
import type {
  ConfirmPrintedResult,
  PrintJob,
  PrintSkippedOrder,
} from '../../print-orders/types';
import {
  PRINT_TIMES_MAX,
  claimOrdersForPrint,
  releasePrintClaims,
} from '../../print-orders/services/printOrders';
import { useMarkOrdersPrinted } from '../../print-orders/hooks/useMarkOrdersPrinted';

interface PrintConfirmDialogProps {
  job: PrintJob | null;
  invoiceCount: number;
  onReprint: () => Promise<void>;
  onClose: () => void;
}

function warnLostClaims(skipped: PrintSkippedOrder[]) {
  const movedCount = skipped.filter(
    (s) => s.reason === 'CLAIMED_BY_OTHER' || s.reason === 'PRINTED'
  ).length;
  const goneCount = skipped.length - movedCount;
  if (movedCount > 0) {
    toast.warning(`${movedCount} طلب انتقل لمستخدم آخر ولن يُعلَّم كمطبوع`);
  }
  if (goneCount > 0) {
    toast.warning(`${goneCount} طلب لم يعد متاحًا للطباعة ولن يُعلَّم كمطبوع`);
  }
}

function reportResult(result: ConfirmPrintedResult) {
  if (result.printedCount > 0) {
    toast.success(`تم تعليم ${result.printedCount} طلب كمطبوع`);
  }
  if (result.reprintedCount > 0) {
    toast.success(`تم تسجيل إعادة طباعة ${result.reprintedCount} طلب`);
  }
  if (result.skippedIds.length > 0) {
    toast.warning(`${result.skippedIds.length} طلب لم يُعلَّم كمطبوع`);
  }
  if (
    result.printedCount === 0 &&
    result.reprintedCount === 0 &&
    result.skippedIds.length === 0
  ) {
    toast.info('لم يتم تعليم أي طلب كمطبوع');
  }
}

export function PrintConfirmDialog({
  job,
  invoiceCount,
  onReprint,
  onClose,
}: PrintConfirmDialogProps) {
  const [claimedIds, setClaimedIds] = useState<number[]>([]);
  const [printTimes, setPrintTimes] = useState(1);
  const [markDone, setMarkDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { mutateAsync: confirmPrinted } = useMarkOrdersPrinted();

  const refreshClaims = useCallback(async (ids: number[]) => {
    if (ids.length === 0) return ids;
    try {
      const { claimed, skipped } = await claimOrdersForPrint(ids);
      const kept = new Set(claimed.map((order) => order.id));
      warnLostClaims(skipped.filter((s) => !kept.has(s.id)));
      return ids.filter((id) => kept.has(id));
    } catch (error) {
      toast.warning(
        getApiErrorMessage(error, 'تعذر تجديد حجز الطلبات، سيتم التحقق عند التأكيد')
      );
      return ids;
    }
  }, []);

  useEffect(() => {
    if (!job) return;
    let active = true;
    setClaimedIds(job.claimedIds);
    setPrintTimes(1);
    setMarkDone(false);
    setBusy(true);
    refreshClaims(job.claimedIds).then((kept) => {
      if (!active) return;
      setClaimedIds(kept);
      setBusy(false);
    });
    return () => {
      active = false;
    };
  }, [job, refreshClaims]);

  const handleConfirm = async () => {
    if (!job || busy) return;
    setBusy(true);
    try {
      const result = await confirmPrinted({
        markIds: markDone ? [] : [...claimedIds, ...job.markIds],
        reprintIds: job.reprintIds,
        printTimes,
      });
      if (result.reprintError) {
        setMarkDone(true);
        reportResult({ ...result, reprintError: undefined });
        toast.error(
          getApiErrorMessage(result.reprintError, 'تعذر تسجيل إعادة الطباعة، حاول مرة أخرى')
        );
        return;
      }
      reportResult(result);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'تعذر تعليم الطلبات كمطبوعة، حاول مرة أخرى'));
    } finally {
      setBusy(false);
    }
  };

  const handleReprint = async () => {
    if (!job || busy || printTimes >= PRINT_TIMES_MAX) return;
    setBusy(true);
    try {
      const kept = markDone ? claimedIds : await refreshClaims(claimedIds);
      setClaimedIds(kept);
      await onReprint();
      setPrintTimes((times) => times + 1);
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    if (busy) return;
    const ids = markDone ? [] : claimedIds;
    onClose();
    if (ids.length > 0) {
      releasePrintClaims(ids).catch(() => undefined);
    }
  };

  const reprintLimitReached = printTimes >= PRINT_TIMES_MAX;

  return (
    <BaseModal
      isOpen={job !== null}
      onClose={handleCancel}
      title="هل تمت الطباعة؟"
      showFooter={false}
      isLoading={busy}
      maxWidth="max-w-[520px]"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-base text-gray-700">
            تم إرسال {invoiceCount} فاتورة إلى الطابعة. هل خرجت الفواتير بشكل
            سليم؟
          </p>
          <p className="text-sm text-gray-500">
            لن تُعلَّم الطلبات كمطبوعة إلا بعد الضغط على «نعم، تمت الطباعة».
          </p>
          {printTimes > 1 && (
            <p className="text-sm font-semibold text-primary" role="status">
              عدد مرات الطباعة: {printTimes}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row-reverse gap-2 sm:gap-3">
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className="h-11 sm:flex-1 rounded-[28px] bg-primary text-white hover:bg-[#4B1BC4] font-bold"
          >
            <LiaCheckSolid className="size-5" />
            نعم، تمت الطباعة
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReprint}
            disabled={busy || reprintLimitReached}
            title={reprintLimitReached ? 'تم الوصول للحد الأقصى لإعادة الطباعة' : undefined}
            className="h-11 sm:flex-1 rounded-[28px] border-primary text-primary font-bold"
          >
            <LiaPrintSolid className="size-5" />
            إعادة الطباعة
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={busy}
            className="h-11 sm:flex-1 rounded-[28px] border-[#ECECEC] text-[#5F5E5E] font-bold"
          >
            <LiaTimesSolid className="size-5" />
            لا، إلغاء
          </Button>
        </div>
        {reprintLimitReached && (
          <p className="text-xs text-center text-gray-500">
            تم الوصول للحد الأقصى لإعادة الطباعة ({PRINT_TIMES_MAX} مرات)
          </p>
        )}
      </div>
    </BaseModal>
  );
}
