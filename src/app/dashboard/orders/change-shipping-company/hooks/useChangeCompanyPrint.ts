'use client';

import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import type { Order } from '@/types/orders';
import { useInvoicePrinter } from '@/app/dashboard/orders/print-orders/hooks/useInvoicePrinter';
import { useInvoiceSettings } from '@/app/dashboard/orders/print-orders/hooks/useInvoiceSettings';
import type { PrintJob } from '@/app/dashboard/orders/print-orders/types/printOrders';
import { claimOrdersForPrint } from '@/app/dashboard/orders/print-orders/services/printOrders';
import { mapOrdersToInvoices } from '@/app/dashboard/orders/print-orders/utils/invoiceMapper';
import { printApiErrorMessage } from '@/app/dashboard/orders/print-orders/utils/printApiError';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';

export function useChangeCompanyPrint() {
  const printer = useInvoicePrinter();
  const { storeInfo, language } = useInvoiceSettings();
  const [job, setJob] = useState<PrintJob | null>(null);
  const printablesRef = useRef<Order[]>([]);
  const printingRef = useRef(false);

  const printSwitched = useCallback(
    async (orderIds: number[]) => {
      if (orderIds.length === 0 || printingRef.current) return;
      printingRef.current = true;
      try {
        const { claimed, skipped } = await claimOrdersForPrint(orderIds);
        const invoiceById = new Map(claimed.map((order) => [order.id, order]));
        const reprintIds: number[] = [];
        const markIds: number[] = [];
        for (const item of skipped) {
          if (item.reason !== 'PRINTED' && item.reason !== 'NOT_CONFIRMED') {
            toast.warning(item.message || CHANGE_COMPANY_TEXT.printSkipped);
            continue;
          }
          if (!item.invoice) continue;
          invoiceById.set(item.id, item.invoice);
          (item.reason === 'PRINTED' ? reprintIds : markIds).push(item.id);
        }

        const printable = orderIds
          .map((id) => invoiceById.get(id))
          .filter((order): order is Order => order !== undefined);
        if (printable.length === 0) {
          toast.error(CHANGE_COMPANY_TEXT.printNothing);
          return;
        }

        printablesRef.current = printable;
        await printer.print(mapOrdersToInvoices(printable, language));
        setJob({
          claimedIds: claimed.map((order) => order.id),
          markIds,
          reprintIds,
        });
      } catch (error: unknown) {
        toast.error(printApiErrorMessage(error, CHANGE_COMPANY_TEXT.fetchForPrintFailed));
      } finally {
        printingRef.current = false;
      }
    },
    [printer, language]
  );

  const closeJob = useCallback(() => {
    setJob(null);
    printablesRef.current = [];
    printer.clear();
  }, [printer]);

  return {
    printer,
    job,
    printablesRef,
    storeInfo,
    language,
    printSwitched,
    closeJob,
  };
}
