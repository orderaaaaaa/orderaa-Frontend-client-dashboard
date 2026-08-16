'use client';

import { useEffect, useMemo, useState } from 'react';
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

// Money stays a string end to end: the column is Decimal(12,2) and the wire
// contract is a decimal string, so parsing to a float here would be the one
// place precision could quietly be lost.
const decimalString = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} مطلوبة`)
    .regex(/^\d+(\.\d{1,2})?$/, `${label} يجب أن تكون رقمًا موجبًا`);

const governorateConfigSchema = z.object({
  configs: z.array(
    z.object({
      governorate: z.string().min(1),
      firstAttemptDelay: z.preprocess(
        (val) => (val === '' ? 0 : Number(val)),
        z
          .number({ invalid_type_error: 'أدخل عدد الأيام' })
          .int('يجب أن يكون عددًا صحيحًا')
          .min(0, 'لا يمكن أن تكون القيمة سالبة')
      ),
      shippingCost: decimalString('تكلفة الشحن'),
      nonReceiptCost: decimalString('تكلفة عدم الاستلام'),
    })
  ),
});

type GovernorateConfigFormData = z.infer<typeof governorateConfigSchema>;

// `useFieldArray`'s own types do not resolve in this project (the known
// react-hook-form module-resolution issue), so the row shape is named here
// rather than left to fall back to `any`, which .FE-RULES bans.
type GovernorateConfigField = GovernorateConfigFormData['configs'][number] & {
  id: string;
};

interface GovernorateConfigTableProps {
  /** The ShippingCompany enum value, e.g. BOSTA. */
  shippingCompany: string;
}

export function GovernorateConfigTable({
  shippingCompany,
}: GovernorateConfigTableProps) {
  const { data: configs, isLoading } =
    useGovernorateLogisticsConfig(shippingCompany);
  const { mutate: updateConfig, isPending: isSaving } =
    useUpdateGovernorateLogisticsConfig();
  const { data: governorates = [] } = useGovernoratesQuery(true);

  const [governorateToAdd, setGovernorateToAdd] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<GovernorateConfigFormData>({
    resolver: zodResolver(governorateConfigSchema),
    defaultValues: { configs: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'configs',
  });

  useEffect(() => {
    if (!configs) return;
    reset({
      configs: configs.map((c) => ({
        governorate: c.governorate,
        firstAttemptDelay: c.firstAttemptDelay,
        shippingCost: c.shippingCost,
        nonReceiptCost: c.nonReceiptCost,
      })),
    });
  }, [configs, reset]);

  const configured = new Set(
    (fields as GovernorateConfigField[]).map((f) => f.governorate)
  );
  // Governorate rows come from the lookup, never free text — a hand-typed
  // label would not match what orders store and the delay would never fire.
  const available = useMemo(
    () => governorates.filter((g) => !configured.has(g.label)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [governorates, fields]
  );

  const onSubmit = (data: GovernorateConfigFormData) => {
    updateConfig({
      shippingCompany,
      rows: data.configs,
      // Clearing every row wipes this carrier's settings, so it is opt-in.
      confirmEmpty: data.configs.length === 0 ? true : undefined,
    });
  };

  const addGovernorate = () => {
    if (!governorateToAdd) return;
    append({
      governorate: governorateToAdd,
      firstAttemptDelay: 3,
      shippingCost: '0.00',
      nonReceiptCost: '0.00',
    });
    setGovernorateToAdd('');
  };

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <select
          value={governorateToAdd}
          onChange={(e) => setGovernorateToAdd(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white min-w-[180px] focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          <option value="">اختر محافظة لإضافتها</option>
          {available.map((g) => (
            <option key={g.key} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addGovernorate}
          disabled={!governorateToAdd}
        >
          إضافة محافظة
        </Button>
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium">
            لديك تغييرات غير محفوظة
          </span>
        )}
      </div>

      {!fields.length ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          لا توجد محافظات مضافة لهذه الشركة — لن يتم تطبيق مدة أول محاولة حتى
          تضيف محافظة وتحفظ الإعدادات.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[28%]">
                  المحافظة
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[21%]">
                  أول محاولة بعد (أيام)
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[21%]">
                  تكلفة الشحن
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[22%]">
                  تكلفة عدم الاستلام
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[8%]" />
              </tr>
            </thead>
            <tbody>
              {(fields as GovernorateConfigField[]).map((field, index) => (
                <tr
                  key={field.id}
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-2.5 px-4 text-gray-900 font-medium">
                    {field.governorate}
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
                      registerOptions={{ valueAsNumber: true }}
                      error={errors.configs?.[index]?.firstAttemptDelay?.message}
                      inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <Input
                      type="text"
                      name={`configs.${index}.shippingCost`}
                      register={register}
                      error={errors.configs?.[index]?.shippingCost?.message}
                      inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <Input
                      type="text"
                      name={`configs.${index}.nonReceiptCost`}
                      register={register}
                      error={errors.configs?.[index]?.nonReceiptCost?.message}
                      inputClassName="border-gray-200 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    />
                  </td>
                  <td className="py-2.5 px-4 text-left">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-600 hover:text-red-700 hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving} size="sm">
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </form>
  );
}
