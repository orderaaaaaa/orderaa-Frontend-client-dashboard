'use client';

import type { MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import type { Order } from '@/types/orders';
import type { useInvoicePrinter } from '@/app/dashboard/orders/print-orders/hooks/useInvoicePrinter';
import { InvoiceRenderer } from '@/app/dashboard/orders/print-orders/components/InvoiceRenderer';
import type {
  InvoiceLanguage,
  InvoiceStoreInfo,
} from '@/app/dashboard/orders/print-orders/types/invoice';
import type { PrintJob } from '@/app/dashboard/orders/print-orders/types/printOrders';
import { mapOrdersToInvoices } from '@/app/dashboard/orders/print-orders/utils/invoiceMapper';
import { PrintConfirmDialog } from '@/app/dashboard/orders/components/FilterSection/PrintConfirmDialog';

interface SwitchPrintLayerProps {
  job: PrintJob | null;
  printer: ReturnType<typeof useInvoicePrinter>;
  printablesRef: MutableRefObject<Order[]>;
  storeInfo: InvoiceStoreInfo;
  language: InvoiceLanguage;
  onClose: () => void;
}

export function SwitchPrintLayer({
  job,
  printer,
  printablesRef,
  storeInfo,
  language,
  onClose,
}: SwitchPrintLayerProps) {
  const keepJobOrders = (current: PrintJob, claimedIds: number[]) => {
    const allowed = new Set([...claimedIds, ...current.markIds, ...current.reprintIds]);
    const kept = printablesRef.current.filter((order) => allowed.has(order.id));
    if (kept.length !== printablesRef.current.length) {
      printablesRef.current = kept;
      printer.replace(mapOrdersToInvoices(kept, language));
    }
    return kept.length;
  };

  return (
    <>
      <PrintConfirmDialog
        job={job}
        invoiceCount={printer.invoices.length}
        onKeep={keepJobOrders}
        onReprint={() => printer.print()}
        onClose={onClose}
      />

      {typeof window !== 'undefined' &&
        printer.invoices.length > 0 &&
        createPortal(
          <div ref={printer.containerRef} className="print-container hidden print:block">
            {printer.invoices.map((invoice, index) => (
              <InvoiceRenderer
                key={index}
                data={invoice}
                storeInfo={storeInfo}
                language={language}
              />
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
