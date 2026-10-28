'use client';

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { QUERY_KEYS } from '@/lib/api/queryKeys';
import { invalidateAndWait } from '@/lib/query/mutationSync';
import { getApiErrorStatus } from '@/utils/apiError';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import { formatMoney } from '@/utils/formatMoney';
import { useDeleteSupplierInvoiceMutation } from '@/services/suppliers';

export interface DeletableInvoice {
  id: number;
  code: string;
  paymentAmount: number | null;
}

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: DeletableInvoice | null;
  onDeleted?: () => void;
}

const STALE_STATUSES = [404, 409];

export function DeleteInvoiceModal({ isOpen, onClose, invoice, onDeleted }: DeleteInvoiceModalProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteSupplierInvoiceMutation();

  const paymentLine = invoice?.paymentAmount
    ? `المبلغ المدفوع المسجل على الفاتورة ${formatMoney(String(invoice.paymentAmount))} سيخرج من أرصدة المورد مع الفاتورة.`
    : 'لا يوجد مبلغ مدفوع على هذه الفاتورة، ولن يتغير رصيد المورد من مدفوعاتها.';

  const handleConfirm = async () => {
    if (!invoice) return;
    try {
      await deleteMutation.mutateAsync(invoice.id);
      toast.success('تم حذف الفاتورة');
      onClose();
      onDeleted?.();
    } catch (err: unknown) {
      toast.error(supplierInvoiceErrorMessage(err, 'تعذّر حذف الفاتورة'));
      const status = getApiErrorStatus(err);
      if (status !== undefined && STALE_STATUSES.includes(status)) {
        await invalidateAndWait(queryClient, [
          [QUERY_KEYS.SUPPLIER_INVOICES],
          [QUERY_KEYS.SUPPLIER_INVOICE_DETAIL, invoice.id],
        ]);
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="حذف الفاتورة"
      onConfirm={handleConfirm}
      confirmText="حذف الفاتورة"
      confirmButtonClassName="bg-destructive text-white hover:bg-destructive/90"
      isLoading={deleteMutation.isPending}
      maxWidth="md:max-w-lg"
    >
      <div className="flex flex-col gap-3 text-sm text-foreground">
        <p>
          سيتم حذف الفاتورة{' '}
          <span dir="ltr" className="font-semibold tabular-nums">
            {invoice?.code}
          </span>{' '}
          من القوائم والأرصدة. سجل الفاتورة يبقى محفوظاً في سجل التعديلات.
        </p>
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
          {paymentLine}
        </p>
      </div>
    </BaseModal>
  );
}
