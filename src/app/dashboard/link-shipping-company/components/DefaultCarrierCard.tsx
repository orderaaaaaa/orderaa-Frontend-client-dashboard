'use client';

import { toast } from 'react-toastify';
import { ErrorState } from '@/components/ui/state-panels';
import { useHasPermission } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  useClearDefaultCarrierMutation,
  useDefaultCarrierQuery,
  useSetDefaultCarrierMutation,
} from '@/services/shippingDefaultCarrier';
import { providers } from '../constants/providers';
import type { ShippingConfig } from '../types/shipping';

const NONE_VALUE = 'none';
const NONE_LABEL = 'أقدم ربط نشط (الافتراضي)';
const API_KEY_CONFIG_TYPE = 'API_KEY';

interface CarrierOption {
  shippingCompanyId: number;
  label: string;
}

const carrierNameOf = (shippingCompany?: string) =>
  providers.find(
    (provider) => provider.id.toUpperCase() === shippingCompany?.toUpperCase()
  )?.name ??
  shippingCompany ??
  '';

const activeCarrierOptions = (configs: ShippingConfig[]): CarrierOption[] =>
  configs
    .filter(
      (config) => config.isActive && config.configType === API_KEY_CONFIG_TYPE
    )
    .map((config) => ({
      shippingCompanyId: config.shippingCompanyId,
      label: carrierNameOf(config.shippingCompany),
    }));

interface DefaultCarrierCardProps {
  configs: ShippingConfig[];
  configsLoading: boolean;
}

export function DefaultCarrierCard({
  configs,
  configsLoading,
}: DefaultCarrierCardProps) {
  const canRead = useHasPermission(PERMISSION_CODES.SHIPPING_CONFIG_READ);
  const canManage = useHasPermission(PERMISSION_CODES.SHIPPING_CONFIG_MANAGE);
  const defaultQuery = useDefaultCarrierQuery(canRead);
  const setMutation = useSetDefaultCarrierMutation();
  const clearMutation = useClearDefaultCarrierMutation();

  if (!canRead) return null;

  const isSaving = setMutation.isPending || clearMutation.isPending;
  const storedId = defaultQuery.data?.shippingCompanyId ?? null;
  const options = activeCarrierOptions(configs);
  const effectiveId = options.some(
    (option) => option.shippingCompanyId === storedId
  )
    ? storedId
    : null;
  const selectedValue = effectiveId === null ? NONE_VALUE : String(effectiveId);
  const radioChoices = [
    { value: NONE_VALUE, label: NONE_LABEL },
    ...options.map((option) => ({
      value: String(option.shippingCompanyId),
      label: option.label,
    })),
  ];
  const selectedLabel =
    options.find((option) => option.shippingCompanyId === effectiveId)?.label ??
    NONE_LABEL;

  const handleChange = (value: string) => {
    if (value === NONE_VALUE) {
      clearMutation.mutate(undefined, {
        onSuccess: () => toast.success('تم إلغاء الشركة الافتراضية'),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, 'تعذّر تحديث الشركة الافتراضية')),
      });
      return;
    }
    setMutation.mutate(
      { shippingCompanyId: Number(value) },
      {
        onSuccess: () => toast.success('تم تحديد الشركة الافتراضية'),
        onError: (err) =>
          toast.error(getApiErrorMessage(err, 'تعذّر تحديث الشركة الافتراضية')),
      }
    );
  };

  return (
    <section className="bg-card rounded-2xl p-5 sm:p-6 border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold text-gray-900">
        الشركة الافتراضية للطلبات المستوردة
      </h2>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        تُستخدم هذه الشركة للطلبات المستوردة من ملف Excel والطلبات القادمة من
        المنصات المربوطة تلقائياً.
      </p>

      {configsLoading || defaultQuery.isLoading ? (
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
      ) : defaultQuery.isError ? (
        <ErrorState
          error={defaultQuery.error}
          fallback="تعذّر تحميل الشركة الافتراضية"
          onRetry={() => defaultQuery.refetch()}
        />
      ) : !canManage ? (
        <p className="text-sm text-gray-700">
          الشركة الافتراضية الحالية:{' '}
          <span className="font-semibold">{selectedLabel}</span>
        </p>
      ) : (
        <fieldset disabled={isSaving} className="flex flex-col gap-3">
          <legend className="sr-only">الشركة الافتراضية</legend>
          {radioChoices.map((choice) => (
            <label
              key={choice.value}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <input
                  type="radio"
                  name="default-carrier"
                  value={choice.value}
                  checked={selectedValue === choice.value}
                  onChange={(event) => handleChange(event.target.value)}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary transition-all"
                />
                <div className="absolute w-2.5 h-2.5 bg-primary rounded-full scale-0 peer-checked:scale-100 transition-transform" />
              </div>
              <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-primary-text transition-colors">
                {choice.label}
              </span>
            </label>
          ))}
          {options.length === 0 && (
            <p className="text-sm text-gray-500">
              لا توجد شركات شحن مربوطة ونشطة بعد.
            </p>
          )}
        </fieldset>
      )}
    </section>
  );
}
