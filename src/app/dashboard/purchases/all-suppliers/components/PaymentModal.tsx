'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { INVOICE_LIFECYCLE, type SupplierInvoiceApiItem } from '@/lib/api/suppliers';
import { useCreateSupplierInvoiceMutation, useSupplierInvoicesQuery } from '@/services/suppliers';
import { formatMoney } from '@/utils/formatMoney';
import {
  MONEY_DECIMALS_MESSAGE,
  hasAtMostTwoDecimals,
  moneyCents,
} from '@/utils/money';
import { supplierInvoiceErrorMessage } from '@/lib/api/supplierInvoiceErrors';
import { formatCurrency, formatSupplierBalance } from '../utils';

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, 'المبلغ مطلوب')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'يجب أن يكون المبلغ أكبر من صفر',
    })
    .refine(hasAtMostTwoDecimals, { message: MONEY_DECIMALS_MESSAGE }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

const INVOICE_PICKER_LIMIT = 20;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number;
  supplierName: string;
  remaining: number;
  held: number;
}

interface LinkedInvoicePickerProps {
  supplierId: number;
  selected: SupplierInvoiceApiItem | null;
  onSelect: (invoice: SupplierInvoiceApiItem | null) => void;
}

function invoiceOptionLabel(invoice: SupplierInvoiceApiItem): string {
  return `${invoice.code} · إجمالي ${formatMoney(String(invoice.totalAmount))} · متبقٍ ${formatMoney(String(invoice.outstandingAmount ?? 0))}`;
}

function LinkedInvoicePicker({ supplierId, selected, onSelect }: LinkedInvoicePickerProps) {
  const [search, setSearch] = useState('');
  const { data, isFetching } = useSupplierInvoicesQuery({
    supplierId,
    type: 'PURCHASE',
    outstanding: true,
    search: search || undefined,
    page: 1,
    limit: INVOICE_PICKER_LIMIT,
  });
  const invoices = data?.data ?? [];
  const options = invoices.map((invoice) => ({ key: String(invoice.id), value: invoiceOptionLabel(invoice) }));

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">لفاتورة</span>
      <SearchableSelect
        value={selected ? String(selected.id) : ''}
        displayValue={selected ? invoiceOptionLabel(selected) : undefined}
        onChange={(key) => onSelect(invoices.find((invoice) => String(invoice.id) === key) ?? null)}
        onClear={() => onSelect(null)}
        options={options}
        placeholder="بدون فاتورة"
        searchPlaceholder="ابحث برقم الفاتورة"
        onSearch={setSearch}
        loading={isFetching}
        clearable
      />
    </div>
  );
}

export default function PaymentModal({
  isOpen,
  onClose,
  supplierId,
  supplierName: _supplierName,
  remaining,
  held,
}: PaymentModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [linkedInvoice, setLinkedInvoice] = useState<SupplierInvoiceApiItem | null>(null);
  const createInvoiceMutation = useCreateSupplierInvoiceMutation();
  const isLinkedOpen = linkedInvoice !== null && linkedInvoice.lifecycle !== INVOICE_LIFECYCLE.CLOSED;
  const totalOwed = Math.max(remaining + held, 0);
  const limit = linkedInvoice ? linkedInvoice.outstandingAmount ?? 0 : totalOwed;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amount: '' },
  });

  const handleClose = useCallback(() => {
    reset();
    setShowSuccess(false);
    setPendingAmount(null);
    setSubmitError(null);
    setLinkedInvoice(null);
    onClose();
  }, [reset, onClose]);

  const submitPayment = useCallback(
    async (amount: number) => {
      setSubmitError(null);
      try {
        await createInvoiceMutation.mutateAsync({
          type: 'PAID',
          supplierId,
          paymentAmount: amount,
          ...(linkedInvoice ? { settlesInvoiceId: linkedInvoice.id } : {}),
        });
        setPendingAmount(null);
        setShowSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err: unknown) {
        setSubmitError(supplierInvoiceErrorMessage(err, 'حدث خطأ أثناء تسجيل الدفع'));
      }
    },
    [supplierId, linkedInvoice, handleClose, createInvoiceMutation],
  );

  const onSubmit = useCallback(
    async (data: PaymentFormValues) => {
      const amount = Number(data.amount);
      if (moneyCents(amount) > moneyCents(Math.max(limit, 0))) {
        setSubmitError(null);
        setPendingAmount(amount);
        return;
      }
      await submitPayment(amount);
    },
    [limit, submitPayment],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? '' : pendingAmount !== null ? 'المبلغ أكبر من المستحق' : 'إضافة معاملة جديدة'}
      showFooter={false}
      maxWidth="md:max-w-[500px]"
    >
      {showSuccess ? (
        <div className="flex flex-col items-center gap-6 py-4">
          <svg
            className="w-24 h-24"
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="48"
              cy="48"
              r="46"
              stroke="#bbf7d0"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-[draw-circle_0.6s_ease-out_forwards]"
              style={{
                strokeDasharray: 289,
                strokeDashoffset: 289,
              }}
            />
            <path
              d="M28 50 L42 64 L68 34"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-[draw-check_0.4s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 80,
                strokeDashoffset: 80,
              }}
            />
          </svg>
          <p className="text-lg font-bold text-gray-800">
            تم تسجيل الدفع بنجاح
          </p>
        </div>
      ) : pendingAmount !== null ? (
        <div className="flex flex-col gap-6">
          <p className="text-base leading-7 text-gray-700">
            {linkedInvoice
              ? `المبلغ (${formatCurrency(pendingAmount)}) أكبر من المتبقي على الفاتورة ${linkedInvoice.code} (${formatCurrency(limit)}). هل تريد المتابعة؟`
              : `المبلغ (${formatCurrency(pendingAmount)}) أكبر من إجمالي المستحق للمورد (${formatCurrency(totalOwed)}). هل تريد المتابعة؟`}
          </p>
          <p className="text-base leading-7 text-gray-700">
            {isLinkedOpen
              ? `بعد الدفع سينخفض المعلّق من ${formatCurrency(held)} إلى ${formatCurrency(held - pendingAmount)}.`
              : `بعد الدفع سيصبح الرصيد ${formatSupplierBalance(remaining - pendingAmount).text}.`}
          </p>

          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              disabled={createInvoiceMutation.isPending}
              className="rounded-xl font-bold text-base py-3 px-8"
              onClick={() => submitPayment(pendingAmount)}
            >
              تأكيد الدفع
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-bold text-base py-3 px-8"
              onClick={() => {
                setSubmitError(null);
                setPendingAmount(null);
              }}
            >
              تعديل المبلغ
            </Button>
          </div>
        </div>
      ) : (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-6"
          >
            {isOpen && (
              <LinkedInvoicePicker
                supplierId={supplierId}
                selected={linkedInvoice}
                onSelect={setLinkedInvoice}
              />
            )}

            <Input
              label="المبلغ"
              name="amount"
              type="number"
              placeholder="0.00"
              register={register}
              error={errors.amount?.message}
              inputClassName="bg-background"
              step="0.01"
              min="0"
            />

            {submitError && (
              <p className="text-red-500 text-sm">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={createInvoiceMutation.isPending}
              className="w-full sm:w-[60%] mx-auto rounded-xl font-bold text-base py-3"
            >
              دفع
            </Button>
          </form>
        </>
      )}
    </BaseModal>
  );
}
