'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import type { LucideIcon } from 'lucide-react';
import {
  LiaBarcodeSolid,
  LiaBoxSolid,
  LiaTimesCircleSolid,
  LiaUndoAltSolid,
} from 'react-icons/lia';
import Input from '@/components/ui/Input';
import { OrderStatus } from '@/types/orders';
import { getReturnOrderByCode } from '../../services';
import type { CategoryBucket, ReturnOrder } from '../../types';
import { BucketSection } from './BucketSection';
import { ResendInvoicesPrint } from './ResendInvoicesPrint';
import { TotalsChips } from './TotalsChips';

interface Step2CategorizeProps {
  categorizationScans: string[];
  setCategorizationScans: React.Dispatch<React.SetStateAction<string[]>>;
  orderCache: Record<string, ReturnOrder>;
  setOrderCache: React.Dispatch<
    React.SetStateAction<Record<string, ReturnOrder>>
  >;
}

const normalize = (code: string) => code.trim().toUpperCase();

const scanFormSchema = z.object({
  barcode: z.string(),
});

type ScanFormValues = z.infer<typeof scanFormSchema>;

export function Step2Categorize({
  categorizationScans,
  setCategorizationScans,
  orderCache,
  setOrderCache,
}: Step2CategorizeProps) {
  const [isResolving, setIsResolving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { control, getValues, setValue } = useForm<ScanFormValues>({
    resolver: zodResolver(scanFormSchema),
    defaultValues: { barcode: '' },
    mode: 'onChange',
  });

  const handleScan = useCallback(
    async (rawCode: string) => {
      const code = normalize(rawCode);

      if (categorizationScans.includes(code)) {
        toast.warn(`تم مسح الكود ${code} من قبل`);
        return;
      }

      setIsResolving(true);
      try {
        const order = await getReturnOrderByCode(code);
        if (order.status === OrderStatus.FINAL_RETURN) {
          toast.warn(`الطلب ${code} مُرتجع نهائي بالفعل`);
          return;
        }
        setCategorizationScans((prev) =>
          prev.includes(code) ? prev : [code, ...prev],
        );
        setOrderCache((prev) => ({ ...prev, [code]: order }));
      } catch (err) {
        const anyErr = err as {
          response?: { status?: number; data?: { message?: string } };
        };
        if (anyErr?.response?.status === 404) {
          toast.error(`كود غير معروف: ${code}`);
        } else {
          toast.error(
            anyErr?.response?.data?.message ?? `تعذر إضافة الكود ${code}`,
          );
        }
      } finally {
        setIsResolving(false);
      }
    },
    [categorizationScans, setCategorizationScans, setOrderCache],
  );

  const handleBarcodeKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (isResolving) return;
      const code = (getValues('barcode') ?? '').trim();
      if (!code) return;
      handleScan(code);
      setValue('barcode', '', { shouldValidate: false });
    },
    [getValues, setValue, handleScan, isResolving],
  );

  const removeScan = useCallback(
    (code: string) => {
      setCategorizationScans((prev) => prev.filter((c) => c !== code));
    },
    [setCategorizationScans],
  );

  const { resendCodes, finalReturnCodes, warehouseCodes } = useMemo(() => {
    const resend: string[] = [];
    const finalReturn: string[] = [];
    const warehouse: string[] = [];
    for (const code of categorizationScans) {
      const bucket = orderCache[code]?.bucket;
      if (bucket === 'RESEND') resend.push(code);
      else if (bucket === 'FINAL_RETURN') finalReturn.push(code);
      else if (bucket === 'WAREHOUSE') warehouse.push(code);
    }
    return {
      resendCodes: resend,
      finalReturnCodes: finalReturn,
      warehouseCodes: warehouse,
    };
  }, [categorizationScans, orderCache]);

  const counts: Record<CategoryBucket, number> = {
    RESEND: resendCodes.length,
    FINAL_RETURN: finalReturnCodes.length,
    WAREHOUSE: warehouseCodes.length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              تقسيم الطلبات على التصنيفات
            </h3>
            <p className="text-xs text-gray-500">
              امسح الطلب ليتم تصنيفه تلقائياً من النظام
            </p>
          </div>
          <TotalsChips counts={counts} />
        </div>

        <Input
          control={control}
          name="barcode"
          ref={inputRef}
          label="كود الطلب"
          required
          icon={LiaBarcodeSolid as unknown as LucideIcon}
          onKeyDown={handleBarcodeKeyDown}
          placeholder="امسح الكود ثم اضغط Enter"
          disabled={isResolving}
        />
      </div>

      <div className="flex flex-col gap-3">
        <BucketSection
          title="إعادة إرسال"
          icon={LiaUndoAltSolid}
          accentClasses="border-amber-200 bg-amber-50/40"
          countBadgeClasses="bg-amber-200 text-amber-900"
          codes={resendCodes}
          orderCache={orderCache}
          onRemove={removeScan}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        >
          <ResendInvoicesPrint
            resendCodes={resendCodes}
            orderCache={orderCache}
          />
        </BucketSection>

        <BucketSection
          title="مرتجع نهائي"
          icon={LiaTimesCircleSolid}
          accentClasses="border-rose-200 bg-rose-50/40"
          countBadgeClasses="bg-rose-200 text-rose-900"
          codes={finalReturnCodes}
          orderCache={orderCache}
          onRemove={removeScan}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        />

        <BucketSection
          title="مخزن المرتجعات"
          icon={LiaBoxSolid}
          accentClasses="border-indigo-200 bg-indigo-50/40"
          countBadgeClasses="bg-indigo-200 text-indigo-900"
          codes={warehouseCodes}
          orderCache={orderCache}
          onRemove={removeScan}
          emptyMessage="لا يوجد طلبات في هذا التصنيف"
        />
      </div>
    </div>
  );
}
