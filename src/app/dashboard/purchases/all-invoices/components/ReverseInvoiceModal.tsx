'use client';

import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import { formatMoney } from '@/utils/formatMoney';
import { useReverseSupplierInvoiceMutation } from '@/services/suppliers';

export interface ReversibleInvoice {
  id: number;
  code: string;
  paymentAmount: number | null;
}

interface ReverseInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ReversibleInvoice | null;
}

export function ReverseInvoiceModal({ isOpen, onClose, invoice }: ReverseInvoiceModalProps) {
  const reverseMutation = useReverseSupplierInvoiceMutation();

  const handleConfirm = async () => {
    if (!invoice) return;
    try {
      await reverseMutation.mutateAsync(invoice.id);
      toast.success('تم عكس الدفعة وتسجيل دفعة عكسية');
      onClose();
    } catch (err: unknown) {
      toast.error(supplierInvoiceErrorMessage(err, 'تعذّر عكس الدفعة'));
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="عكس الدفعة"
      onConfirm={handleConfirm}
      confirmText="عكس الدفعة"
      confirmButtonClassName="w-[120px] h-10 sm:w-[146px] sm:h-[37px] bg-destructive dark:bg-destructive/60 border-[1.5px] border-destructive rounded-[28px] flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      isLoading={reverseMutation.isPending}
      maxWidth="md:max-w-lg"
    >
      <div className="flex flex-col gap-3 text-sm text-foreground">
        <p>
          سيتم تسجيل دفعة عكسية بمبلغ{' '}
          <span dir="ltr" className="font-semibold tabular-nums">
            {formatMoney(String(invoice?.paymentAmount ?? 0))}
          </span>{' '}
          للدفعة{' '}
          <span dir="ltr" className="font-semibold tabular-nums">
            {invoice?.code}
          </span>
          . الدفعة الأصلية لا تُعدَّل ولا تُحذف، ولا يمكن عكسها مرة أخرى.
        </p>
        <p className="rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
          يعود رصيد المورد إلى ما قبل هذه الدفعة.
        </p>
      </div>
    </BaseModal>
  );
}
