'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  useGovernorateLogisticsConfig,
  useUpdateGovernorateLogisticsConfig,
} from '@/services/logistics';
import PageLoading from '@/components/ui/page-loading';

const governorateConfigSchema = z.object({
  configs: z.array(
    z.object({
      governorateKey: z.string(),
      governorateName: z.string(),
      firstAttemptAfterDays: z.preprocess(
        (val) => (val === '' ? 0 : Number(val)),
        z.number().min(1, 'يجب أن يكون يوم واحد على الأقل')
      ),
      shippingCompanyCost: z.preprocess(
        (val) => (val === '' ? 0 : Number(val)),
        z.number().min(0, 'لا يمكن أن تكون القيمة سالبة')
      ),
    })
  ),
});

type GovernorateConfigFormData = z.infer<typeof governorateConfigSchema>;

interface GovernorateConfigTableProps {
  shippingCompanyId: number;
}

export function GovernorateConfigTable({
  shippingCompanyId,
}: GovernorateConfigTableProps) {
  const { data: configs, isLoading } =
    useGovernorateLogisticsConfig(shippingCompanyId);
  const { mutate: updateConfig, isPending: isSaving } =
    useUpdateGovernorateLogisticsConfig();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<GovernorateConfigFormData>({
    resolver: zodResolver(governorateConfigSchema),
    defaultValues: { configs: [] },
  });

  const { fields } = useFieldArray({ control, name: 'configs' });

  useEffect(() => {
    if (configs && configs.length > 0) {
      reset({
        configs: configs.map((c) => ({
          governorateKey: c.governorateKey,
          governorateName: c.governorateName,
          firstAttemptAfterDays: c.firstAttemptAfterDays,
          shippingCompanyCost: c.shippingCompanyCost,
        })),
      });
    }
  }, [configs, reset]);

  const onSubmit = (data: GovernorateConfigFormData) => {
    updateConfig({
      shippingCompanyId,
      configs: data.configs.map((c) => ({
        governorateKey: c.governorateKey,
        firstAttemptAfterDays: c.firstAttemptAfterDays,
        shippingCompanyCost: c.shippingCompanyCost,
      })),
    });
  };

  if (isLoading) {
    return <PageLoading size="sm" className="py-6 min-h-0" />;
  }

  if (!fields.length) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        لا توجد محافظات مضافة لهذه الشركة
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[40%]">
                المحافظة
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[30%]">
                أول محاولة بعد (أيام)
              </th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700 w-[30%]">
                تكلفة الشحن
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr
                key={field.id}
                className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
              >
                <td className="py-2.5 px-4 text-gray-900 font-medium">
                  {field.governorateName}
                  <input
                    type="hidden"
                    {...register(`configs.${index}.governorateKey`)}
                  />
                  <input
                    type="hidden"
                    {...register(`configs.${index}.governorateName`)}
                  />
                </td>
                <td className="py-2.5 px-4">
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    {...register(`configs.${index}.firstAttemptAfterDays`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.configs?.[index]?.firstAttemptAfterDays && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.configs[index].firstAttemptAfterDays?.message}
                    </p>
                  )}
                </td>
                <td className="py-2.5 px-4">
                  <input
                    type="number"
                    min={0}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
                    {...register(`configs.${index}.shippingCompanyCost`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.configs?.[index]?.shippingCompanyCost && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.configs[index].shippingCompanyCost?.message}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSaving} size="sm">
          {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </Button>
      </div>
    </form>
  );
}
