'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import {
  LiaCheckCircleSolid,
  LiaFileUploadSolid,
  LiaLockSolid,
} from 'react-icons/lia';
import { ImageUploadField } from '@/components/ui/image-upload-field';
import { Button } from '@/components/ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useUploadReceiptProofMutation } from '../../hooks/useReturnsMutations';

interface ProofUploadPanelProps {
  enabled: boolean;
  onComplete: () => void;
  receiptImage: File | null;
  setReceiptImage: (file: File | null) => void;
  proofUploaded: boolean;
  setProofUploaded: (uploaded: boolean) => void;
}

const proofSchema = z.object({
  receiptImage: z.custom<File>((v) => v instanceof File, {
    message: 'يرجى رفع صورة الإيصال المستلم من مندوب الشحن',
  }),
});

type ProofFormValues = z.infer<typeof proofSchema>;

export function ProofUploadPanel({
  enabled,
  onComplete,
  receiptImage,
  setReceiptImage,
  proofUploaded,
  setProofUploaded,
}: ProofUploadPanelProps) {
  const uploadMutation = useUploadReceiptProofMutation();

  const { control, handleSubmit, reset } = useForm<ProofFormValues>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      receiptImage: receiptImage as File,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const watchedReceipt = useWatch({ control, name: 'receiptImage' });
  const hasReceipt = watchedReceipt instanceof File;

  useEffect(() => {
    reset({
      receiptImage: receiptImage as File,
    });
  }, [receiptImage, reset]);

  const onSubmit = async (values: ProofFormValues) => {
    await uploadMutation.mutateAsync({
      receipt: values.receiptImage,
    });
    setProofUploaded(true);
    onComplete();
  };

  return (
    <AccordionItem
      value="proof"
      disabled={!enabled}
      className={clsx(
        '!border rounded-xl overflow-hidden',
        !enabled
          ? 'bg-gray-50 border-gray-200'
          : proofUploaded
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-white border-gray-200',
      )}
    >
      <AccordionTrigger
        className={clsx(
          'px-4 sm:px-5 py-3 hover:no-underline',
          'disabled:opacity-100 disabled:[&>svg]:hidden',
        )}
      >
        {!enabled ? (
          <div className="flex items-center gap-3 w-full text-start text-gray-400">
            <LiaLockSolid className="w-5 h-5 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-bold">2- رفع الاستلام (الإيصال)</h3>
              <p className="text-xs">
                يفتح هذا القسم بعد الانتهاء من المسح الرئيسي
              </p>
            </div>
          </div>
        ) : proofUploaded ? (
          <div className="flex items-center gap-3 w-full text-start">
            <LiaCheckCircleSolid className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-bold text-emerald-900 text-base sm:text-lg">
                تم رفع الاستلام
              </h3>
              <p className="text-xs text-emerald-700">
                الإيصال ({receiptImage?.name || 'ملف محفوظ'})
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full text-start pe-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              2- رفع الاستلام
            </h3>
            <span className="text-xs text-gray-500">
              صورة الإيصال المستلم من مندوب الشحن
            </span>
          </div>
        )}
      </AccordionTrigger>
      <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Controller
            control={control}
            name="receiptImage"
            render={({ field, fieldState }) => (
              <ImageUploadField
                value={field.value}
                onChange={(file) => {
                  field.onChange(file);
                  setReceiptImage(file);
                }}
                title="صورة الإيصال"
                description="صورة واحدة للإيصال المستلم من مندوب الشحن"
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={uploadMutation.isPending || !hasReceipt}
              size="lg"
              className="min-w-[160px]"
            >
              <LiaFileUploadSolid className="w-5 h-5" />
              {uploadMutation.isPending ? 'جاري الرفع...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </AccordionContent>
    </AccordionItem>
  );
}
