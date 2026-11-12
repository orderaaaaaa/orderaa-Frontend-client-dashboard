'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, PackageX } from 'lucide-react';
import { LiaPlusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import CustomerPicker from '@/components/customers/CustomerPicker';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { Textarea } from '@/components/ui/textarea';
import useShippingCompanies from '@/hooks/useShippingCompanies';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import {
  useCreateCustomerReturn,
  useCustomerReturnCandidates,
} from '@/services/customerReturns';
import {
  useLocationOptionCities,
  useLocationOptionGovernorates,
} from '@/services/lookups';
import { shippingCompanyIdOf } from '@/lib/shippingCompanies';
import { cn } from '@/lib/utils';
import { matchLocationOption } from '@/utils/locationOptionMatch';
import type {
  CreateCustomerReturnResponse,
  CustomerReturnPreset,
} from '@/types/customer-return';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  CARRIER_SEND_NOT_SENT_WARNING,
  carrierSendNeedsAttention,
} from '@/utils/manualOrder/carrierSend';
import {
  refundValueOf,
  returnPriceOf,
  selectedUnitsOf,
} from '@/utils/customerReturn/selection';
import { customerReturnContentOf } from '@/utils/customerReturn/returnContent';
import {
  RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
  isBlankReturnShipmentContent,
} from '@/utils/partialDelivery/returnShipmentContent';
import type { Customer } from '@/app/dashboard/customers/types/customer';
import type { CarrierSupportState } from '@/app/dashboard/upload-products/manual/types';
import ConfirmationSection from '../manual/ConfirmationSection';
import ShippingSection from '../manual/ShippingSection';
import ReturnSourceOrders from './ReturnSourceOrders';
import ReturnSummaryPanel from './ReturnSummaryPanel';

type ReturnDraft = {
  shippingCompanyId: string;
  governorateOption: string;
  cityOption: string;
  area: string;
  address: string;
  notes: string;
  needsConfirmation: boolean;
};

type ReturnErrorKey =
  | 'customer'
  | 'units'
  | 'shippingCompanyId'
  | 'governorateOption'
  | 'cityOption'
  | 'address'
  | 'returnContent'
  | 'returnPrice';

type ReturnErrors = Partial<Record<ReturnErrorKey, string>>;

type CarrierSupportEntry = CarrierSupportState & { name: string };

type CustomerPick = Pick<Customer, 'id' | 'name' | 'phoneNumbers'>;

type CustomerReturnFormProps = {
  preset?: CustomerReturnPreset;
  initialCustomerId?: number;
  onCreated?: (response: CreateCustomerReturnResponse) => void;
  onPendingChange?: (pending: boolean) => void;
};

const draftFromPreset = (preset: CustomerReturnPreset): ReturnDraft => ({
  shippingCompanyId:
    preset.shippingCompanyId === null ? '' : String(preset.shippingCompanyId),
  governorateOption: preset.governorateOption ?? '',
  cityOption: preset.cityOption ?? '',
  area: preset.area,
  address: preset.address,
  notes: '',
  needsConfirmation: false,
});

const EMPTY_DRAFT: ReturnDraft = {
  shippingCompanyId: '',
  governorateOption: '',
  cityOption: '',
  area: '',
  address: '',
  notes: '',
  needsConfirmation: false,
};

const EMPTY_SELECTED_IDS: ReadonlySet<number> = new Set();

const CARD_CLASS =
  'flex w-full min-w-0 flex-col gap-6 rounded-xl border border-border bg-card shadow-sm max-sm:p-5 p-8';

const SIDE_CARD_CLASS =
  'flex w-full min-w-0 flex-col gap-6 rounded-xl border border-border bg-card shadow-sm max-sm:p-5 p-8';

const CONFIRM_SWITCH_CLASS =
  'data-[state=unchecked]:bg-zinc-500 dark:data-[state=unchecked]:bg-zinc-400 border border-border';

const TOAST_WARNING_CLASS =
  '!bg-amber-50 !text-amber-900 dark:!bg-amber-950 dark:!text-amber-100';

const MISSING_FIELD_KEYS: Record<ReturnErrorKey, TranslationKey> = {
  customer: 'customerReturn.customer.label',
  units: 'customerReturn.field.units',
  shippingCompanyId: 'customerReturn.field.company',
  governorateOption: 'customerReturn.field.governorate',
  cityOption: 'customerReturn.field.city',
  address: 'customerReturn.address.label',
  returnContent: 'customerReturn.returnContent.label',
  returnPrice: 'customerReturn.summary.returnPrice',
};

const ERROR_FIELD_IDS: Record<ReturnErrorKey, string> = {
  customer: 'return-customer',
  units: 'return-units',
  shippingCompanyId: 'shippingCompanyId',
  governorateOption: 'governorate',
  cityOption: 'city',
  address: 'return-address',
  returnContent: 'return-content',
  returnPrice: 'return-price',
};

function CustomerReturnForm({
  preset,
  initialCustomerId,
  onCreated,
  onPendingChange,
}: CustomerReturnFormProps) {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const initialLoadSettledRef = useRef(false);
  const isPreset = preset !== undefined;
  const [customerId, setCustomerId] = useState<number | null>(
    preset?.customerId ?? initialCustomerId ?? null,
  );
  const [pickedCustomer, setPickedCustomer] = useState<CustomerPick | null>(
    null,
  );
  const [selectedIds, setSelectedIds] =
    useState<ReadonlySet<number>>(EMPTY_SELECTED_IDS);
  const [draft, setDraft] = useState<ReturnDraft>(() =>
    preset ? draftFromPreset(preset) : EMPTY_DRAFT,
  );
  const [errors, setErrors] = useState<ReturnErrors>({});
  const [contentOverride, setContentOverride] = useState<string | null>(null);
  const [priceOverride, setPriceOverride] = useState<string | null>(null);
  const [attention, setAttention] = useState<{
    orderId: number;
    code: string;
  } | null>(null);
  const candidatesQuery = useCustomerReturnCandidates(customerId);
  const {
    data: candidates,
    isError: candidatesFailed,
    error: candidatesError,
  } = candidatesQuery;
  const createReturn = useCreateCustomerReturn();
  const { shippingCompanies } = useShippingCompanies(true);
  const orders = candidates?.orders ?? [];
  const lastAddress = candidates?.customer.lastAddress ?? null;
  const storedGovernorateName = isPreset
    ? (preset.governorateOption ?? preset.governorateName)
    : lastAddress?.governorate;
  const storedCityName = isPreset
    ? (preset.cityOption ?? preset.cityName)
    : lastAddress?.city;
  const pickerCustomer = useMemo<CustomerPick | null>(() => {
    if (customerId === null) return null;
    if (pickedCustomer?.id === customerId) return pickedCustomer;
    if (candidates?.customer.id !== customerId) return null;
    return {
      id: candidates.customer.id,
      name: candidates.customer.name,
      phoneNumbers: candidates.customer.phoneNumbers,
    };
  }, [customerId, pickedCustomer, candidates]);

  const companyId = shippingCompanyIdOf(draft.shippingCompanyId);
  const governoratesQuery = useLocationOptionGovernorates(companyId);
  const citiesQuery = useLocationOptionCities(
    companyId,
    draft.governorateOption || undefined,
  );
  const matchedGovernorate = useMemo(
    () =>
      matchLocationOption(
        governoratesQuery.data?.options,
        storedGovernorateName,
      ),
    [governoratesQuery.data, storedGovernorateName],
  );
  const matchedCity = useMemo(
    () => matchLocationOption(citiesQuery.data?.options, storedCityName),
    [citiesQuery.data, storedCityName],
  );

  const carrierSupportById = useMemo(() => {
    const map: Record<string, CarrierSupportEntry> = {};
    candidatesQuery.data?.carrierSupport.forEach((carrier) => {
      map[String(carrier.shippingCompanyId)] = {
        name: carrier.name,
        supported: carrier.supported,
        reason: carrier.reason,
      };
    });
    return map;
  }, [candidatesQuery.data]);

  const selectedUnits = selectedUnitsOf(orders, selectedIds);
  const refundValue = refundValueOf(selectedUnits);
  const priceText = priceOverride ?? String(refundValue);
  const returnPrice = returnPriceOf(priceText);
  const prefill = customerReturnContentOf(selectedUnits);
  const contentValue = contentOverride ?? prefill;
  const sentContent =
    contentOverride === null || isBlankReturnShipmentContent(contentOverride)
      ? prefill
      : contentOverride;
  const contentTooLong = sentContent.length > RETURN_SHIPMENT_CONTENT_MAX_LENGTH;
  const selectedCarrier = carrierSupportById[draft.shippingCompanyId] ?? null;
  const selectedCompanyName =
    selectedCarrier?.name ??
    shippingCompanies.find(
      (company) => String(company.id) === draft.shippingCompanyId,
    )?.name ??
    null;

  useEffect(() => {
    if (isPreset || !lastAddress) return;
    setDraft((current) => ({
      ...current,
      address: lastAddress.address ?? '',
      area: lastAddress.area ?? '',
    }));
  }, [isPreset, lastAddress]);

  useEffect(() => {
    if (initialCustomerId === undefined || initialLoadSettledRef.current)
      return;
    if (customerId !== initialCustomerId) {
      initialLoadSettledRef.current = true;
      return;
    }
    if (!candidatesFailed) {
      if (candidates?.customer.id === initialCustomerId)
        initialLoadSettledRef.current = true;
      return;
    }
    initialLoadSettledRef.current = true;
    setCustomerId(null);
    toast.error(
      getApiErrorMessage(candidatesError, t('customerReturn.orders.loadError')),
    );
  }, [
    initialCustomerId,
    customerId,
    candidates,
    candidatesFailed,
    candidatesError,
    t,
  ]);

  useEffect(() => {
    onPendingChange?.(createReturn.isPending);
  }, [createReturn.isPending, onPendingChange]);

  useEffect(() => {
    if (!matchedGovernorate || draft.governorateOption) return;
    setDraft((current) => ({
      ...current,
      governorateOption: matchedGovernorate.value,
    }));
  }, [matchedGovernorate, draft.governorateOption]);

  useEffect(() => {
    if (!matchedCity || draft.cityOption) return;
    if (
      !matchedGovernorate ||
      draft.governorateOption !== matchedGovernorate.value
    )
      return;
    setDraft((current) => ({ ...current, cityOption: matchedCity.value }));
  }, [
    matchedCity,
    matchedGovernorate,
    draft.cityOption,
    draft.governorateOption,
  ]);

  const hasStoredLocation =
    !!lastAddress?.governorate || !!lastAddress?.city;
  const storedLocationMatched =
    !!matchedGovernorate && (!lastAddress?.city || !!matchedCity);
  const storedLocationLabel = [matchedGovernorate?.label, matchedCity?.label]
    .filter(Boolean)
    .join(' - ');

  const locationHint =
    lastAddress && hasStoredLocation ? (
      <p className="mt-4 text-sm text-muted-foreground">
        {storedLocationMatched
          ? t('customerReturn.lastAddress.hint', {
              location: storedLocationLabel,
            })
          : t('customerReturn.lastAddress.unmatched')}
      </p>
    ) : null;

  const updateDraft = (patch: Partial<ReturnDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    const cleared: ReturnErrors = {};
    (Object.keys(patch) as (keyof ReturnDraft)[]).forEach((key) => {
      if (key in ERROR_FIELD_IDS) cleared[key as ReturnErrorKey] = undefined;
    });
    if ('needsConfirmation' in patch) cleared.shippingCompanyId = undefined;
    setErrors((current) => ({ ...current, ...cleared }));
  };

  const handleCustomerChange = (next: CustomerPick | null) => {
    setCustomerId(next?.id ?? null);
    setPickedCustomer(next);
    setAttention(null);
    setSelectedIds(EMPTY_SELECTED_IDS);
    setContentOverride(null);
    setPriceOverride(null);
    setDraft((current) => ({
      ...current,
      address: '',
      area: '',
      notes: '',
      governorateOption: '',
      cityOption: '',
    }));
    setErrors((current) => ({
      ...current,
      customer: undefined,
      units: undefined,
      returnContent: undefined,
      returnPrice: undefined,
      address: undefined,
      governorateOption: undefined,
      cityOption: undefined,
    }));
  };

  const handleToggleUnit = (orderProductId: number) => {
    setErrors((current) => ({
      ...current,
      units: undefined,
      returnContent: undefined,
      returnPrice: undefined,
    }));
    setContentOverride(null);
    setPriceOverride(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderProductId)) next.delete(orderProductId);
      else next.add(orderProductId);
      return next;
    });
  };

  const handleToggleOrder = (orderProductIds: number[], select: boolean) => {
    setErrors((current) => ({
      ...current,
      units: undefined,
      returnContent: undefined,
      returnPrice: undefined,
    }));
    setContentOverride(null);
    setPriceOverride(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      orderProductIds.forEach((id) =>
        select ? next.add(id) : next.delete(id),
      );
      return next;
    });
  };

  const validate = (): ReturnErrors => {
    const next: ReturnErrors = {};
    if (customerId === null)
      next.customer = t('customerReturn.customer.required');
    if (selectedUnits.length === 0)
      next.units = t('customerReturn.errors.units');
    if (!draft.shippingCompanyId) {
      next.shippingCompanyId = t('customerReturn.errors.company');
    } else if (
      !draft.needsConfirmation &&
      selectedCarrier &&
      !selectedCarrier.supported
    ) {
      next.shippingCompanyId = t('customerReturn.errors.carrierUnsupported');
    }
    if (!draft.governorateOption)
      next.governorateOption = t('customerReturn.errors.governorate');
    if (!draft.cityOption) next.cityOption = t('customerReturn.errors.city');
    if (!draft.address.trim())
      next.address = t('customerReturn.errors.address');
    if (selectedUnits.length > 0 && isBlankReturnShipmentContent(sentContent)) {
      next.returnContent = t('customerReturn.returnContent.required');
    } else if (contentTooLong) {
      next.returnContent = t('customerReturn.returnContent.tooLong', {
        max: RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
      });
    }
    if (returnPrice === null) next.returnPrice = t('customerReturn.errors.returnPrice');
    return next;
  };

  const handleSubmit = () => {
    if (createReturn.isPending) return;
    const nextErrors = validate();
    setErrors(nextErrors);
    const firstError = (Object.keys(ERROR_FIELD_IDS) as ReturnErrorKey[]).find(
      (key) => nextErrors[key],
    );
    if (firstError) {
      const field = formRef.current?.querySelector<HTMLElement>(
        `[data-field-error="${ERROR_FIELD_IDS[firstError]}"]`,
      );
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field
        ?.querySelector<HTMLElement>('input, textarea, button')
        ?.focus({ preventScroll: true });
      return;
    }
    if (customerId === null || returnPrice === null) return;

    setAttention(null);
    const notes = draft.notes.trim();
    const area = draft.area.trim();
    createReturn.mutate(
      {
        customerId,
        orderProductIds: selectedUnits.map((unit) => unit.orderProductId),
        confirm: !draft.needsConfirmation,
        shippingCompanyId: companyId,
        governorateOption: draft.governorateOption,
        cityOption: draft.cityOption,
        address: draft.address.trim(),
        ...(area && { area }),
        ...(notes && { notes }),
        returnShipmentContent: sentContent,
        returnPrice,
      },
      {
        onSuccess: (created) => {
          toast.success(
            t('customerReturn.submit.success', { code: created.code }),
          );
          if (carrierSendNeedsAttention(created.carrierSend)) {
            setAttention({ orderId: created.id, code: created.code });
            toast.warning(CARRIER_SEND_NOT_SENT_WARNING, {
              className: TOAST_WARNING_CLASS,
            });
          }
          setSelectedIds(EMPTY_SELECTED_IDS);
          setContentOverride(null);
          setPriceOverride(null);
          setDraft((current) => ({ ...current, notes: '' }));
          setErrors({});
          onCreated?.(created);
        },
        onError: (err: unknown) => {
          toast.error(
            getApiErrorMessage(err, t('customerReturn.submit.error')),
          );
        },
      },
    );
  };

  const renderOrders = () => {
    if (customerId === null) {
      return (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t('customerReturn.orders.selectCustomer')}
        </p>
      );
    }
    if (candidatesQuery.isLoading) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 bg-muted border border-border/60" />
          <Skeleton className="h-32 bg-muted border border-border/60" />
        </div>
      );
    }
    if (candidatesQuery.isError) {
      return (
        <ErrorState
          error={candidatesQuery.error}
          fallback={t('customerReturn.orders.loadError')}
          onRetry={() => void candidatesQuery.refetch()}
        />
      );
    }
    if (orders.length === 0) {
      return (
        <EmptyState
          icon={
            <PackageX className="size-10 text-muted-foreground" aria-hidden="true" />
          }
          title={t('customerReturn.orders.empty')}
          description={t('customerReturn.orders.emptyHelp')}
        />
      );
    }
    return (
      <ReturnSourceOrders
        orders={orders}
        selectedIds={selectedIds}
        onToggleUnit={handleToggleUnit}
        onToggleOrder={handleToggleOrder}
      />
    );
  };

  const isDirty =
    customerId !== null || selectedIds.size > 0 || draft.address !== '';
  const isPending = createReturn.isPending;
  const missingFields = (Object.keys(ERROR_FIELD_IDS) as ReturnErrorKey[]).filter(
    (key) => errors[key],
  );
  const missingStatus =
    missingFields.length > 0
      ? t('customerReturn.submit.missing', {
          count: missingFields.length,
          items: missingFields
            .map((key) => t(MISSING_FIELD_KEYS[key]))
            .join('، '),
        })
      : null;

  const governorateLabel =
    draft.governorateOption === ''
      ? null
      : (governoratesQuery.data?.options.find(
          (option) => option.value === draft.governorateOption,
        )?.label ??
        preset?.governorateName ??
        null);
  const cityLabel =
    draft.cityOption === ''
      ? null
      : (citiesQuery.data?.options.find(
          (option) => option.value === draft.cityOption,
        )?.label ??
        preset?.cityName ??
        null);
  const presetRows = [
    {
      label: t('customerReturn.field.company'),
      value: selectedCompanyName,
      missing: draft.shippingCompanyId === '' || selectedCompanyName === null,
      pending: false,
    },
    {
      label: t('customerReturn.field.governorate'),
      value: governorateLabel || null,
      missing: draft.governorateOption === '',
      pending: governoratesQuery.isLoading,
    },
    {
      label: t('customerReturn.field.city'),
      value: cityLabel || null,
      missing: draft.cityOption === '',
      pending: citiesQuery.isLoading,
    },
    {
      label: t('customerReturn.area.label'),
      value: draft.area.trim() || null,
      missing: false,
      pending: false,
    },
    {
      label: t('customerReturn.address.label'),
      value: draft.address.trim() || null,
      missing: draft.address.trim() === '',
      pending: false,
    },
  ];
  const presetBlocked =
    isPreset && presetRows.some((row) => row.missing || row.pending);

  const footerStatus = isPending ? (
    t('customerReturn.submit.statusSaving')
  ) : missingStatus ? (
    <span className="font-medium text-destructive">{missingStatus}</span>
  ) : isDirty ? (
    t('customerReturn.submit.statusDirty')
  ) : (
    t('customerReturn.submit.status')
  );

  const submitButton = (
    <Button
      type="submit"
      disabled={isPending || presetBlocked}
      loading={isPending}
      loadingText={t('customerReturn.submit.loading')}
      className="min-h-10 min-w-40 rounded-full font-bold"
    >
      <LiaPlusSolid className="w-5 h-5 text-primary-foreground" />
      {t('customerReturn.submit.button')}
    </Button>
  );

  const pickerLabel = (
    <p className="font-bold text-[19px]">{t('customerReturn.customer.label')}</p>
  );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-[26px]"
    >
      {attention && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="flex min-w-0 flex-col gap-1">
            <p className="font-semibold">
              {t('customerReturn.submit.created', { code: attention.code })}
            </p>
            <p className="text-sm">{CARRIER_SEND_NOT_SENT_WARNING}</p>
            <Link
              href={`/dashboard/orders/${attention.orderId}`}
              className="mt-1 w-fit rounded-sm text-sm font-semibold underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {t('customerReturn.submit.viewOrder')}
            </Link>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex flex-col gap-[26px]',
          !isPreset &&
            'lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6',
        )}
      >
        <div className="flex min-w-0 flex-col gap-[26px]">
          {isPreset ? (
            <div className={CARD_CLASS}>
              {pickerLabel}
              {candidatesQuery.isLoading ? (
                <Skeleton className="h-16 bg-muted border border-border/60" />
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold text-foreground">
                      {candidates?.customer.name ?? '—'}
                    </span>
                    <span dir="ltr" className="text-start text-sm text-muted-foreground">
                      {candidates?.customer.phoneNumbers[0] ?? '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={CARD_CLASS}>
              <h1 className="font-bold text-[22px]">
                {t('customerReturn.customer.label')}
              </h1>
              <CustomerPicker
                id="return-customer"
                value={pickerCustomer}
                onChange={handleCustomerChange}
                error={errors.customer}
              />
            </div>
          )}

          <div className={CARD_CLASS}>
            <h2 className="font-bold text-[19px]">
              {t('customerReturn.orders.title')}
            </h2>
            <div data-field-error="return-units">{renderOrders()}</div>
            {errors.units && (
              <p className="text-sm text-destructive">{errors.units}</p>
            )}
          </div>

          <div className={CARD_CLASS}>
            {!isPreset && (
              <>
              <div
                data-field-error="return-address"
                className="flex flex-col gap-2"
              >
                <label
                  htmlFor="return-address-input"
                  className="font-medium text-[16px]"
                >
                  {t('customerReturn.address.label')}{' '}
                  <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="return-address-input"
                  name="address"
                  value={draft.address}
                  onChange={(e) => updateDraft({ address: e.target.value })}
                  placeholder={t('customerReturn.address.placeholder')}
                  className="bg-background"
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="return-area-input"
                  className="font-medium text-[16px]"
                >
                  {t('customerReturn.area.label')}
                </label>
                <Input
                  id="return-area-input"
                  name="area"
                  value={draft.area}
                  onChange={(e) => updateDraft({ area: e.target.value })}
                  placeholder={t('customerReturn.area.placeholder')}
                  className="w-full"
                  inputClassName="bg-background"
                />
              </div>
              </>
            )}
            <div
              data-field-error="return-content"
              className="flex flex-col gap-2"
            >
              <label
                htmlFor="return-content-input"
                className="font-medium text-[16px]"
              >
                {t('customerReturn.returnContent.label')}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="return-content-input"
                name="returnContent"
                value={contentValue}
                onChange={(e) => {
                  setContentOverride(e.target.value);
                  setErrors((current) => ({ ...current, returnContent: undefined }));
                }}
                onBlur={() => {
                  if (isBlankReturnShipmentContent(contentOverride)) setContentOverride(null);
                }}
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                <span dir="ltr" className="tabular-nums">
                  {t('customerReturn.returnContent.counter', {
                    count: contentValue.length,
                    max: RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
                  })}
                </span>
              </p>
              {contentTooLong ? (
                <p className="text-sm text-destructive">
                  {t('customerReturn.returnContent.tooLong', {
                    max: RETURN_SHIPMENT_CONTENT_MAX_LENGTH,
                  })}
                </p>
              ) : (
                errors.returnContent && (
                  <p className="text-sm text-destructive">{errors.returnContent}</p>
                )
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="return-notes-input"
                className="font-medium text-[16px]"
              >
                {t('customerReturn.notes.label')}
              </label>
              <Textarea
                id="return-notes-input"
                name="notes"
                value={draft.notes}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, notes: e.target.value }))
                }
                className="bg-background"
              />
            </div>
          </div>
        </div>

        <aside
          className={cn(
            'flex min-w-0 flex-col gap-[26px]',
            !isPreset && 'lg:sticky lg:top-4',
          )}
        >
          {isPreset ? (
            <div className={SIDE_CARD_CLASS}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-[19px]">
                  {t('customerReturn.preset.shippingTitle')}
                </h2>
                <Link
                  href={`/dashboard/upload-products/return?customerId=${customerId}`}
                  className="rounded-sm text-sm font-semibold text-primary-text underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {t('customerReturn.preset.edit')}
                </Link>
              </div>
              <dl className="flex flex-col gap-3">
                {presetRows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <dt className="text-sm text-muted-foreground">{row.label}</dt>
                    <dd
                      className={cn(
                        'min-w-0 break-words font-medium',
                        row.missing && 'text-destructive',
                      )}
                    >
                      {row.pending ? (
                        <Skeleton className="h-4 w-32 bg-muted" />
                      ) : (
                        row.value ??
                        (row.missing ? t('customerReturn.preset.notSet') : '—')
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
              {presetRows.some((row) => row.missing) && (
                <p className="text-sm text-destructive">
                  {t('customerReturn.preset.missing')}
                </p>
              )}
              {errors.shippingCompanyId && (
                <p className="text-sm text-destructive">
                  {errors.shippingCompanyId}
                </p>
              )}
            </div>
          ) : (
            <ShippingSection
              mode="return"
              idPrefix="return"
              carrierSupport={carrierSupportById}
              locationHint={locationHint}
              shippingCompanyId={draft.shippingCompanyId}
              governorateOption={draft.governorateOption}
              cityOption={draft.cityOption}
              shippingCost=""
              returnShippingCost=""
              shippingType=""
              returnShipmentContent=""
              onShippingCompanyChange={(v) => updateDraft({ shippingCompanyId: v })}
              onGovernorateOptionChange={(v) => updateDraft({ governorateOption: v })}
              onCityOptionChange={(v) => updateDraft({ cityOption: v })}
              onShippingCostChange={() => undefined}
              onReturnShippingCostChange={() => undefined}
              onShippingTypeChange={() => undefined}
              onReturnShipmentContentChange={() => undefined}
              errors={{
                shippingCompanyId: errors.shippingCompanyId,
                governorateOption: errors.governorateOption,
                cityOption: errors.cityOption,
              }}
            />
          )}

          <ConfirmationSection
            description={t('customerReturn.confirm.description')}
            needsConfirmation={draft.needsConfirmation}
            onNeedsConfirmationChange={(v) => updateDraft({ needsConfirmation: v })}
            className="bg-transparent px-0"
            switchClassName={CONFIRM_SWITCH_CLASS}
          />

          <div className={SIDE_CARD_CLASS}>
            <h2 className="font-bold text-[19px]">
              {t('customerReturn.summary.title')}
            </h2>
            <ReturnSummaryPanel
              unitsCount={selectedUnits.length}
              returnPrice={priceText}
              onReturnPriceChange={(value) => {
                setPriceOverride(value);
                setErrors((current) => ({ ...current, returnPrice: undefined }));
              }}
              returnPriceError={errors.returnPrice}
              shippingCompanyName={selectedCompanyName}
              carrier={selectedCarrier}
              pickupAddress={draft.address.trim()}
            />
          </div>
        </aside>
      </div>

      {isPreset ? (
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-border pt-4">
          <div className="min-w-0 text-sm text-gray-500" aria-live="polite">
            {footerStatus}
          </div>
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {submitButton}
          </div>
        </div>
      ) : (
        <StickyFormFooter
          isDirty={isDirty}
          isSaving={isPending}
          className="border-border shadow-[0_-4px_12px_rgb(0_0_0/0.06)] dark:shadow-none"
          status={footerStatus}
        >
          {submitButton}
        </StickyFormFooter>
      )}
    </form>
  );
}

export default CustomerReturnForm;
