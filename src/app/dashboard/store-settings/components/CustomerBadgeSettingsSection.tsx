'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import BaseModal from '@/components/ui/base-modal';
import { ErrorState } from '@/components/ui/state-panels';
import { usePermissionCheck } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/lib/permissions';
import { CustomerBadgeChip } from '@/app/dashboard/customers/components/CustomerBadgeChip';
import { CUSTOMER_BADGE_PRIORITY } from '@/app/dashboard/customers/constants/SearchConst';
import type {
  CustomerBadge,
  CustomerBadgeSettings,
  CustomerBadgeThresholds,
} from '@/app/dashboard/customers/types/customer';
import {
  useCustomerBadgeSettings,
  useResetCustomerBadgeSettings,
  useUpdateCustomerBadgeSettings,
} from '../hooks/useCustomerBadgeSettings';
import { GroupSection } from './SectionHeader';

type ThresholdKey = keyof CustomerBadgeThresholds;

type ThresholdValues = Record<ThresholdKey, string>;

interface ThresholdField {
  key: ThresholdKey;
  label: string;
  unit: string;
  max: number;
  decimals: boolean;
}

const MAX_INT_THRESHOLD = 2_147_483_647;
const MAX_HIGH_VALUE_MIN_DELIVERED = 9_999_999_999.99;

const THRESHOLD_KEYS: ThresholdKey[] = [
  'highValueMinDelivered',
  'bulkMinAvgPieces',
  'loyalMinDelivered',
  'loyalMinSuccessPercent',
  'ghostMinReturns',
  'windowMinOrders',
  'windowMinCancelled',
];

const BADGE_FIELDS: Record<CustomerBadge, ThresholdField[]> = {
  ghost: [
    {
      key: 'ghostMinReturns',
      label: 'أقل عدد مرتجعات',
      unit: 'طلب',
      max: MAX_INT_THRESHOLD,
      decimals: false,
    },
  ],
  window: [
    {
      key: 'windowMinOrders',
      label: 'أقل عدد طلبات',
      unit: 'طلب',
      max: MAX_INT_THRESHOLD,
      decimals: false,
    },
    {
      key: 'windowMinCancelled',
      label: 'أقل عدد طلبات ملغية',
      unit: 'طلب',
      max: MAX_INT_THRESHOLD,
      decimals: false,
    },
  ],
  high: [
    {
      key: 'highValueMinDelivered',
      label: 'أقل قيمة للطلبات المستلمة',
      unit: 'ج.م',
      max: MAX_HIGH_VALUE_MIN_DELIVERED,
      decimals: true,
    },
  ],
  bulk: [
    {
      key: 'bulkMinAvgPieces',
      label: 'أقل متوسط قطع لكل طلب مستلم',
      unit: 'قطعة',
      max: MAX_INT_THRESHOLD,
      decimals: false,
    },
  ],
  loyal: [
    {
      key: 'loyalMinDelivered',
      label: 'أقل عدد طلبات مستلمة',
      unit: 'طلب',
      max: MAX_INT_THRESHOLD,
      decimals: false,
    },
    {
      key: 'loyalMinSuccessPercent',
      label: 'أقل نسبة نجاح',
      unit: '%',
      max: 100,
      decimals: false,
    },
  ],
};

const FIELD_BY_KEY = Object.fromEntries(
  Object.values(BADGE_FIELDS)
    .flat()
    .map((field) => [field.key, field])
) as Record<ThresholdKey, ThresholdField>;

const INTEGER_PATTERN = /^\d+$/;
const DECIMAL_PATTERN = /^\d+(\.\d{1,2})?$/;

const validateThreshold = (
  field: ThresholdField,
  raw: string
): string | null => {
  const value = raw.trim();
  if (value === '') return 'هذا الحقل مطلوب';
  if (field.decimals) {
    if (!DECIMAL_PATTERN.test(value)) {
      return 'أدخل رقماً موجباً بحد أقصى خانتين عشريتين';
    }
  } else if (!INTEGER_PATTERN.test(value)) {
    return 'أدخل رقماً صحيحاً موجباً';
  }
  if (Number(value) > field.max) {
    return `الحد الأقصى ${field.max.toLocaleString('en-US')}`;
  }
  return null;
};

const toValues = (thresholds: CustomerBadgeThresholds): ThresholdValues =>
  Object.fromEntries(
    THRESHOLD_KEYS.map((key) => [key, String(thresholds[key])])
  ) as ThresholdValues;

const describe = (badge: CustomerBadge, values: ThresholdValues) => {
  const v = (key: ThresholdKey) => values[key].trim() || '…';
  switch (badge) {
    case 'ghost':
      return `عميل شبح: ${v('ghostMinReturns')} مرتجعات على الأقل، والمرتجعات لا تقل عن الطلبات المستلمة`;
    case 'window':
      return `عميل متفرج: ${v('windowMinOrders')} طلبات على الأقل دون أي طلب مستلم، منها ${v('windowMinCancelled')} طلبات ملغية على الأقل`;
    case 'high':
      return `قيمة عالية: طلبات مستلمة بقيمة ${v('highValueMinDelivered')} ج.م أو أكثر`;
    case 'bulk':
      return `مشتري بالجملة: متوسط ${v('bulkMinAvgPieces')} قطع أو أكثر في كل طلب مستلم`;
    case 'loyal':
      return `عميل وفي: ${v('loyalMinDelivered')} طلبات مستلمة على الأقل ونسبة نجاح ${v('loyalMinSuccessPercent')}٪ أو أكثر`;
  }
};

const sameBadges = (a: readonly CustomerBadge[], b: readonly CustomerBadge[]) =>
  a.length === b.length && a.every((badge) => b.includes(badge));

function useBeforeUnloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}

export default function CustomerBadgeSettingsSection() {
  const { hasPermission } = usePermissionCheck();
  const canEdit = hasPermission(PERMISSIONS.MERCHANT_SETTINGS_UPDATE);
  const { data, isLoading, isError, error, refetch } = useCustomerBadgeSettings();
  const updateMutation = useUpdateCustomerBadgeSettings();
  const resetMutation = useResetCustomerBadgeSettings();

  const [values, setValues] = useState<ThresholdValues | null>(null);
  const [enabled, setEnabled] = useState<CustomerBadge[]>([]);
  const [loaded, setLoaded] = useState<CustomerBadgeSettings | null>(null);
  const [touched, setTouched] = useState<Partial<Record<ThresholdKey, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  useEffect(() => {
    if (!data || data === loaded) return;
    setLoaded(data);
    setValues(toValues(data.thresholds));
    setEnabled([...data.enabledBadges]);
    setTouched({});
    setSubmitted(false);
  }, [data, loaded]);

  const errors = useMemo(() => {
    const result: Partial<Record<ThresholdKey, string>> = {};
    if (!values) return result;
    THRESHOLD_KEYS.forEach((key) => {
      const message = validateThreshold(FIELD_BY_KEY[key], values[key]);
      if (message) result[key] = message;
    });
    return result;
  }, [values]);

  const hasErrors = Object.keys(errors).length > 0;

  const isDirty = useMemo(() => {
    if (!loaded || !values) return false;
    const thresholdsChanged = THRESHOLD_KEYS.some(
      (key) =>
        values[key].trim() === '' ||
        Number(values[key]) !== loaded.thresholds[key]
    );
    return thresholdsChanged || !sameBadges(enabled, loaded.enabledBadges);
  }, [loaded, values, enabled]);

  useBeforeUnloadGuard(isDirty);

  const isBusy = updateMutation.isPending || resetMutation.isPending;

  const toggleBadge = (badge: CustomerBadge, on: boolean) => {
    setEnabled((prev) =>
      on
        ? CUSTOMER_BADGE_PRIORITY.filter((b) => b === badge || prev.includes(b))
        : prev.filter((b) => b !== badge)
    );
  };

  const handleSave = () => {
    if (!values) return;
    setSubmitted(true);
    if (hasErrors) return;
    const thresholds: CustomerBadgeThresholds = {
      highValueMinDelivered: Number(values.highValueMinDelivered),
      bulkMinAvgPieces: Number(values.bulkMinAvgPieces),
      loyalMinDelivered: Number(values.loyalMinDelivered),
      loyalMinSuccessPercent: Number(values.loyalMinSuccessPercent),
      ghostMinReturns: Number(values.ghostMinReturns),
      windowMinOrders: Number(values.windowMinOrders),
      windowMinCancelled: Number(values.windowMinCancelled),
    };
    updateMutation.mutate({
      thresholds,
      enabledBadges: CUSTOMER_BADGE_PRIORITY.filter((b) => enabled.includes(b)),
    });
  };

  const handleReset = async () => {
    await resetMutation.mutateAsync().then(
      () => setConfirmResetOpen(false),
      () => undefined
    );
  };

  const handleDiscard = () => {
    if (!loaded) return;
    setValues(toValues(loaded.thresholds));
    setEnabled([...loaded.enabledBadges]);
    setTouched({});
    setSubmitted(false);
  };

  const showError = (key: ThresholdKey) =>
    (submitted || touched[key]) && errors[key] ? errors[key] : null;

  return (
    <Card className="mt-6">
      <CardContent className="p-4 sm:p-6 lg:p-10">
        <GroupSection
          title="شارات العملاء"
          description="حدّد متى يحصل العميل على كل شارة. يحصل العميل على شارة واحدة فقط بالترتيب: عميل شبح، عميل متفرج، قيمة عالية، مشتري بالجملة، عميل وفي. تُحتسب الطلبات غير المحذوفة فقط، ولا تُحتسب الطلبات المفقودة ولا مرتجعات التسليم الجزئي."
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3" aria-busy="true">
              {CUSTOMER_BADGE_PRIORITY.map((badge) => (
                <div key={badge} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          ) : isError || !values ? (
            <ErrorState
              error={error}
              fallback="تعذّر تحميل إعدادات شارات العملاء"
              onRetry={() => refetch()}
            />
          ) : (
            <div className="space-y-4">
              {!canEdit && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  لا تملك صلاحية تعديل إعدادات المتجر، لذلك تظهر الإعدادات للعرض فقط.
                </p>
              )}
              {loaded?.isDefault && (
                <p className="text-sm text-gray-500">
                  تُستخدم الإعدادات الافتراضية حالياً.
                </p>
              )}

              <ul className="space-y-3">
                {CUSTOMER_BADGE_PRIORITY.map((badge) => {
                  const isOn = enabled.includes(badge);
                  const switchId = `badge-enabled-${badge}`;
                  return (
                    <li
                      key={badge}
                      className={`rounded-xl border p-4 transition-colors ${
                        isOn ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <CustomerBadgeChip badge={badge} />
                        <label
                          htmlFor={switchId}
                          className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer min-h-10"
                        >
                          <span>{isOn ? 'مفعّلة' : 'معطّلة'}</span>
                          <Switch
                            id={switchId}
                            checked={isOn}
                            disabled={!canEdit || isBusy}
                            onCheckedChange={(on) => toggleBadge(badge, on)}
                          />
                        </label>
                      </div>

                      <p
                        className={`mt-3 text-sm ${isOn ? 'text-gray-700' : 'text-gray-400'}`}
                        aria-live="polite"
                      >
                        {isOn ? describe(badge, values) : 'هذه الشارة معطّلة ولن تُمنح لأي عميل.'}
                      </p>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {BADGE_FIELDS[badge].map((field) => {
                          const inputId = `badge-threshold-${field.key}`;
                          const message = showError(field.key);
                          return (
                            <div key={field.key} className="flex flex-col gap-1">
                              <label
                                htmlFor={inputId}
                                className="text-sm font-medium text-gray-700"
                              >
                                {field.label}
                              </label>
                              <div className="flex items-stretch rounded-lg border border-[#CED4DA] bg-white focus-within:ring-2 focus-within:ring-primary/40 overflow-hidden">
                                <input
                                  id={inputId}
                                  type="text"
                                  inputMode={field.decimals ? 'decimal' : 'numeric'}
                                  dir="ltr"
                                  value={values[field.key]}
                                  disabled={!canEdit || isBusy}
                                  aria-invalid={message ? true : undefined}
                                  aria-describedby={message ? `${inputId}-error` : undefined}
                                  onChange={(event) =>
                                    setValues((prev) =>
                                      prev ? { ...prev, [field.key]: event.target.value } : prev
                                    )
                                  }
                                  onBlur={() =>
                                    setTouched((prev) => ({ ...prev, [field.key]: true }))
                                  }
                                  className="flex-1 min-w-0 h-10 px-3 text-base text-right outline-none disabled:bg-gray-50 disabled:text-gray-500"
                                />
                                <span className="flex items-center px-3 bg-gray-50 border-s border-[#CED4DA] text-sm text-gray-600 shrink-0">
                                  {field.unit}
                                </span>
                              </div>
                              {message && (
                                <p id={`${inputId}-error`} className="text-xs text-red-600">
                                  {message}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {canEdit && (
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-full px-6"
                    disabled={isBusy || loaded?.isDefault === true}
                    onClick={() => setConfirmResetOpen(true)}
                  >
                    استعادة الافتراضي
                  </Button>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {isDirty && (
                      <span className="text-sm text-amber-700" role="status">
                        لديك تغييرات غير محفوظة
                      </span>
                    )}
                    {isDirty && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-10 rounded-full px-6"
                        disabled={isBusy}
                        onClick={handleDiscard}
                      >
                        تجاهل التغييرات
                      </Button>
                    )}
                    <Button
                      type="button"
                      className="h-10 rounded-full px-8 font-bold"
                      disabled={!isDirty || isBusy}
                      loading={updateMutation.isPending}
                      loadingText="جاري الحفظ..."
                      onClick={handleSave}
                    >
                      حفظ الشارات
                    </Button>
                  </div>
                </div>
              )}
              {canEdit && submitted && hasErrors && (
                <p className="text-sm text-red-600" role="alert">
                  صحّح الحقول المحددة قبل الحفظ.
                </p>
              )}
            </div>
          )}
        </GroupSection>
      </CardContent>

      <BaseModal
        isOpen={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title="استعادة الإعدادات الافتراضية"
        onConfirm={handleReset}
        confirmText="استعادة"
        isLoading={resetMutation.isPending}
        maxWidth="md:max-w-lg"
      >
        <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
          <p>
            ستعود كل حدود الشارات إلى القيم الافتراضية وتُفعَّل الشارات الخمس.
          </p>
          {isDirty && <p className="text-amber-700">ستُفقد التغييرات غير المحفوظة.</p>}
        </div>
      </BaseModal>
    </Card>
  );
}
