'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { useCreateSupplierInvoiceMutation } from '@/services/suppliers';
import { moneyCents } from '@/utils/money';
import { formatSupplierBalance } from '../utils';

const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, 'المبلغ مطلوب')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'يجب أن يكون المبلغ أكبر من صفر',
    }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number;
  supplierName: string;
  remaining: number;
}

export default function PaymentModal({
  isOpen,
  onClose,
  supplierId,
  supplierName: _supplierName,
  remaining,
}: PaymentModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const createInvoiceMutation = useCreateSupplierInvoiceMutation();

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
        });
        setPendingAmount(null);
        setShowSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1200);
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفع');
      }
    },
    [supplierId, handleClose, createInvoiceMutation],
  );

  const onSubmit = useCallback(
    async (data: PaymentFormValues) => {
      const amount = Number(data.amount);
      if (moneyCents(amount) > moneyCents(Math.max(remaining, 0))) {
        setSubmitError(null);
        setPendingAmount(amount);
        return;
      }
      await submitPayment(amount);
    },
    [remaining, submitPayment],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? '' : pendingAmount !== null ? 'المبلغ أكبر من المتبقي' : 'إضافة معاملة جديدة'}
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
            المبلغ ({pendingAmount.toLocaleString()} ج.م) أكبر من المتبقي للمورد ({formatSupplierBalance(remaining).text}). بعد الدفع سيصبح الرصيد {formatSupplierBalance(remaining - pendingAmount).text}. هل تريد المتابعة؟
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
            className="flex flex-col gap-6"
          >
            <Input
              label="المبلغ"
              name="amount"
              type="number"
              placeholder="0.00"
              register={register}
              error={errors.amount?.message}
              inputClassName="bg-white"
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
