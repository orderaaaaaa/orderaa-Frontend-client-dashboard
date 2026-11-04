'use client';

import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import { useCloseSupplierInvoiceMutation } from '@/services/suppliers';

export interface ClosableInvoice {
  id: number;
  code: string;
}

interface CloseInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ClosableInvoice | null;
}

export function CloseInvoiceModal({ isOpen, onClose, invoice }: CloseInvoiceModalProps) {
  const closeMutation = useCloseSupplierInvoiceMutation();

  const handleConfirm = async () => {
    if (!invoice) return;
    try {
      await closeMutation.mutateAsync(invoice.id);
      toast.success('تم إغلاق الفاتورة');
      onClose();
    } catch (err: unknown) {
      toast.error(supplierInvoiceErrorMessage(err, 'تعذّر إغلاق الفاتورة'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="إغلاق الفاتورة"
      onConfirm={handleConfirm}
      confirmText="إغلاق الفاتورة"
      isLoading={closeMutation.isPending}
      maxWidth="md:max-w-lg"
    >
      <div className="flex flex-col gap-3 text-sm text-foreground">
        <p>
          سيتم إغلاق الفاتورة{' '}
          <span dir="ltr" className="font-semibold tabular-nums">
            {invoice?.code}
          </span>
          . بعد الإغلاق لا يمكن تعديل الأصناف أو الكميات أو المبالغ ولا حذف الفاتورة.
        </p>
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
          الإغلاق لا يغيّر المخزون. أي تعديل على الكميات يجب أن يتم قبل الإغلاق.
        </p>
      </div>
    </BaseModal>
  );
}
