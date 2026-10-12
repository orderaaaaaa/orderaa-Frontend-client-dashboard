'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
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
import BaseModal from '@/components/ui/base-modal';

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
type GovernorateConfigRow = GovernorateConfigFormData['configs'][number];

type GovernorateConfigField = GovernorateConfigRow & {
  id: string;
};

export type GovernorateConfigDraft = Record<string, GovernorateConfigRow>;

export interface GovernorateConfigDraftStore {
  get: (shippingCompanyId: number) => GovernorateConfigDraft | undefined;
  set: (shippingCompanyId: number, draft: GovernorateConfigDraft) => void;
  remove: (shippingCompanyId: number) => void;
}

const isSameValue = (a: string, b: string) =>
  a === b ||
  (a.trim() !== '' && b.trim() !== '' && Number.isFinite(Number(a)) && Number(a) === Number(b));

const isSameRow = (a: GovernorateConfigRow, b: GovernorateConfigRow) =>
  isSameValue(a.firstAttemptDelay, b.firstAttemptDelay) &&
  isSameValue(a.shippingCost, b.shippingCost) &&
  isSameValue(a.nonReceiptCost, b.nonReceiptCost);

interface GovernorateConfigTableProps {
  shippingCompanyId: number;
  onDirtyChange?: (shippingCompanyId: number, isDirty: boolean) => void;
  draftStore?: GovernorateConfigDraftStore;
}

export function GovernorateConfigTable({
  shippingCompanyId,
  onDirtyChange,
  draftStore,
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
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const savedRowsRef = useRef<GovernorateConfigRow[] | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    getValues,
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

  const syncDraft = useCallback(() => {
    const savedRows = savedRowsRef.current;
    if (!draftStore || !savedRows) return;
    const savedByGovernorate = new Map(savedRows.map((row) => [row.governorate, row]));
    const draft: GovernorateConfigDraft = {};
    for (const row of getValues('configs') ?? []) {
      const saved = savedByGovernorate.get(row.governorate);
      if (!saved || !isSameRow(row, saved)) {
        draft[row.governorate] = { ...row };
      }
    }
    if (Object.keys(draft).length > 0) {
      draftStore.set(shippingCompanyId, draft);
    } else {
      draftStore.remove(shippingCompanyId);
    }
  }, [draftStore, getValues, shippingCompanyId]);

  useEffect(() => {
    const subscription = watch(() => syncDraft());
    return () => subscription.unsubscribe();
  }, [watch, syncDraft]);

  useEffect(() => {
    if (!onDirtyChange) return;
    onDirtyChange(
      shippingCompanyId,
      isDirty || (savedRowsRef.current === null && !!draftStore?.get(shippingCompanyId))
    );
    return () => onDirtyChange(shippingCompanyId, !!draftStore?.get(shippingCompanyId));
  }, [draftStore, isDirty, onDirtyChange, shippingCompanyId]);

  useEffect(() => {
    if (isConfigsLoading || isGovernoratesLoading) return;
    const configByGovernorate = new Map(
      (configs ?? []).flatMap((c) => (c.governorateKey ? [[c.governorateKey, c] as const] : []))
    );
    const savedRows: GovernorateConfigRow[] = governorates.map((g) => {
      const existing = configByGovernorate.get(g.key);
      return {
        governorate: g.key,
        firstAttemptDelay: existing ? String(existing.firstAttemptDelay) : '',
        shippingCost: existing?.shippingCost ?? '',
        nonReceiptCost: existing?.nonReceiptCost ?? '',
      };
    });
    const draft = draftStore?.get(shippingCompanyId);
    savedRowsRef.current = savedRows;
    reset({ configs: savedRows });
    const pendingRows = savedRows.map((row) => {
      const draftRow = draft?.[row.governorate];
      return draftRow && !isSameRow(draftRow, row) ? draftRow : row;
    });
    if (pendingRows.some((row, index) => row !== savedRows[index])) {
      reset({ configs: pendingRows }, { keepDefaultValues: true });
    }
    setSavedGovernorates(
      new Set((configs ?? []).flatMap((c) => (c.governorateKey ? [c.governorateKey] : [])))
    );
  }, [
    configs,
    draftStore,
    governorates,
    isConfigsLoading,
    isGovernoratesLoading,
    reset,
    shippingCompanyId,
  ]);

  const labelByKey = new Map(governorates.map((g) => [g.key, g.label]));

  const send = (data: GovernorateConfigFormData, confirmEmpty: boolean) => {
    const kept = data.configs.filter(
      (row) => row.firstAttemptDelay !== '' || row.shippingCost !== '' || row.nonReceiptCost !== '',
    );
    updateConfig(
      {
        shippingCompanyId,
        rows: kept.map((row) => ({
          governorate: row.governorate,
          firstAttemptDelay: Number(row.firstAttemptDelay),
          shippingCost: row.shippingCost === '' ? null : row.shippingCost,
          nonReceiptCost: row.nonReceiptCost === '' ? null : row.nonReceiptCost,
        })),
        confirmEmpty: confirmEmpty ? true : undefined,
      },
      { onSettled: () => setConfirmEmptyOpen(false) },
    );
  };

  const onSubmit = (data: GovernorateConfigFormData) => {
    const isEmpty = data.configs.every(
      (row) => row.firstAttemptDelay === '' && row.shippingCost === '' && row.nonReceiptCost === '',
    );
    if (isEmpty) {
      setConfirmEmptyOpen(true);
      return;
    }
    send(data, false);
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
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
          event.preventDefault();
        }
      }}
    >
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

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium">
            لديك تغييرات غير محفوظة في المحافظات
          </span>
        )}
        <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSaving} size="sm">
          {isSaving ? 'جاري الحفظ...' : 'حفظ إعدادات المحافظات'}
        </Button>
      </div>

      <BaseModal
        isOpen={confirmEmptyOpen}
        onClose={() => setConfirmEmptyOpen(false)}
        onConfirm={() => send(getValues(), true)}
        title="حذف إعدادات المحافظات"
        confirmText="نعم، احذف الكل"
        isLoading={isSaving}
        maxWidth="md:max-w-lg"
      >
        <p className="text-sm text-red-700 font-medium">
          سيتم حذف إعدادات كل المحافظات لهذه الشركة
        </p>
      </BaseModal>
    </div>
  );
}
