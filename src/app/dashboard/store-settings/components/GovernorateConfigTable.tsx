'use client';

import { Fragment, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import {
  useGovernorateLogisticsConfig,
  useUpdateGovernorateLogisticsConfig,
} from '@/services/logistics';
import { useGovernoratesQuery } from '@/services/lookups';
import PageLoading from '@/components/ui/page-loading';

const decimalString = (label: string) =>
  z
    .string()
    .refine((val) => val === '' || /^\d+(\.\d{1,2})?$/.test(val), `${label} يجب أن تكون رقمًا موجبًا`);

const nonNegativeIntegerString = z
  .string()
  .refine((val) => val === '' || /^\d+$/.test(val), 'يجب أن يكون عددًا صحيحًا');

const governorateConfigRowSchema = z
  .object({
    governorate: z.string().min(1),
    firstAttemptDelay: nonNegativeIntegerString,
    shippingCost: decimalString('تكلفة الشحن'),
    nonReceiptCost: decimalString('تكلفة عدم الاستلام'),
  })
  .superRefine((row, ctx) => {
    const hasCost = row.shippingCost !== '' || row.nonReceiptCost !== '';
    if (hasCost && row.firstAttemptDelay === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'أدخل عدد الأيام',
        path: ['firstAttemptDelay'],
      });
    }
  });

const governorateConfigSchema = z.object({
  configs: z.array(governorateConfigRowSchema),
});

type GovernorateConfigFormData = z.infer<typeof governorateConfigSchema>;

// `useFieldArray`'s own types do not resolve in this project (the known
// react-hook-form module-resolution issue), so the row shape is named here
// rather than left to fall back to `any`, which .FE-RULES bans.
type GovernorateConfigField = GovernorateConfigFormData['configs'][number] & {
  id: string;
};

interface GovernorateConfigTableProps {
  shippingCompanyId: number;
}

export function GovernorateConfigTable({
  shippingCompanyId,
}: GovernorateConfigTableProps) {
  const { data: configs, isLoading: isConfigsLoading } =
    useGovernorateLogisticsConfig(shippingCompanyId);
  const { mutate: updateConfig, isPending: isSaving } =
    useUpdateGovernorateLogisticsConfig();
  const {
    data: governorates = [],
    isLoading: isGovernoratesLoading,
    isError: isGovernoratesError,
  } = useGovernoratesQuery(true);

  const [savedGovernorates, setSavedGovernorates] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<GovernorateConfigFormData>({
    resolver: zodResolver(governorateConfigSchema),
    defaultValues: { configs: [] },
  });

  const { fields } = useFieldArray({
    control,
    name: 'configs',
  });

  const watchedConfigs = watch('configs');

  useEffect(() => {
    if (isConfigsLoading || isGovernoratesLoading) return;
    const configByGovernorate = new Map(
      (configs ?? []).flatMap((c) => (c.governorateKey ? [[c.governorateKey, c] as const] : []))
    );
    reset({
      configs: governorates.map((g) => {
        const existing = configByGovernorate.get(g.key);
        return {
          governorate: g.key,
          firstAttemptDelay: existing ? String(existing.firstAttemptDelay) : '',
          shippingCost: existing?.shippingCost ?? '',
          nonReceiptCost: existing?.nonReceiptCost ?? '',
        };
      }),
    });
    setSavedGovernorates(
      new Set((configs ?? []).flatMap((c) => (c.governorateKey ? [c.governorateKey] : [])))
    );
  }, [configs, governorates, isConfigsLoading, isGovernoratesLoading, reset]);

  const labelByKey = new Map(governorates.map((g) => [g.key, g.label]));

  const onSubmit = (data: GovernorateConfigFormData) => {
    const kept = data.configs.filter(
      (row) => row.firstAttemptDelay !== '' || row.shippingCost !== '' || row.nonReceiptCost !== '',
    );
    updateConfig({
      shippingCompanyId,
      rows: kept.map((row) => ({
        governorate: row.governorate,
        firstAttemptDelay: Number(row.firstAttemptDelay),
        shippingCost: row.shippingCost === '' ? null : row.shippingCost,
        nonReceiptCost: row.nonReceiptCost === '' ? null : row.nonReceiptCost,
      })),
      confirmEmpty: kept.length === 0 ? true : undefined,
    });
  };

  if (isConfigsLoading || isGovernoratesLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  if (isGovernoratesError) {
    return (
      <p className="text-sm text-red-600 text-center py-6">تعذر تحميل المحافظات</p>
    );
  }

  return (
    <div
      className="space-y-4"
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || !(event.target instanceof HTMLInputElement)) return;
        event.preventDefault();
        void handleSubmit(onSubmit)();
      }}
    >
      <div className="flex flex-wrap items-center gap-2 px-1">
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium">
            لديك تغييرات غير محفوظة
          </span>
        )}
      </div>

      {!fields.length ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          لا توجد محافظات متاحة حاليًا.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[30%]">
                  المحافظة
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[23%]">
                  أول محاولة بعد (أيام)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[23%]">
                  تكلفة الشحن
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[24%]">
                  تكلفة عدم الاستلام
                </th>
              </tr>
            </thead>
            <tbody>
              {(fields as GovernorateConfigField[]).map((field, index) => {
                const rowValues = watchedConfigs?.[index];
                const isAllBlank =
                  savedGovernorates.has(field.governorate) &&
                  (rowValues?.firstAttemptDelay ?? '') === '' &&
                  (rowValues?.shippingCost ?? '') === '' &&
                  (rowValues?.nonReceiptCost ?? '') === '';
                return (
                  <Fragment key={field.id}>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-gray-900 font-medium">
                        {labelByKey.get(field.governorate) ?? field.governorate}
                        <input
                          type="hidden"
                          {...register(`configs.${index}.governorate`)}
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <Input
                          type="number"
                          min={0}
                          name={`configs.${index}.firstAttemptDelay`}
                          register={register}
                          error={errors.configs?.[index]?.firstAttemptDelay?.message}
                          inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <Input
                          type="text"
                          placeholder="غير محدد"
                          name={`configs.${index}.shippingCost`}
                          register={register}
                          error={errors.configs?.[index]?.shippingCost?.message}
                          inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <Input
                          type="text"
                          placeholder="غير محدد"
                          name={`configs.${index}.nonReceiptCost`}
                          register={register}
                          error={errors.configs?.[index]?.nonReceiptCost?.message}
                          inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                        />
                      </td>
                    </tr>
                    {isAllBlank && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={4} className="px-4 pb-2 text-xs text-amber-600">
                          سيتم حذف إعدادات هذه المحافظة عند الحفظ
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSaving} size="sm">
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </div>
  );
}
