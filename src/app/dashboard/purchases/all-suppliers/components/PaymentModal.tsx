'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import BaseModal from '@/components/ui/base-modal';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

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
  supplierName: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  supplierName,
}: PaymentModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

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
    onClose();
  }, [reset, onClose]);

  const onSubmit = useCallback(
    (data: PaymentFormValues) => {
      console.log('Payment submitted:', {
        supplierName,
        amount: Number(data.amount),
      });
      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1200);
    },
    [supplierName, handleClose],
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={showSuccess ? '' : 'إضافة معاملة جديدة'}
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

            <Button
              type="submit"
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
