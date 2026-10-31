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
import { normalizeArabic } from '@/utils/arabicNormalize';
import type { LocationOption } from '@/types/locationOptions';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  CARRIER_SEND_NOT_SENT_WARNING,
  carrierSendNeedsAttention,
} from '@/utils/manualOrder/carrierSend';
import {
  refundValueOf,
  selectedUnitsOf,
} from '@/utils/customerReturn/selection';
import type { Customer } from '@/app/dashboard/customers/types/customer';
import type { CarrierSupportState } from '@/app/dashboard/upload-products/manual/types';
import ConfirmationSection from '../ConfirmationSection';
import ShippingSection from '../ShippingSection';
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
  | 'address';

type ReturnErrors = Partial<Record<ReturnErrorKey, string>>;

type CarrierSupportEntry = CarrierSupportState & { name: string };

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
};

const ERROR_FIELD_IDS: Record<ReturnErrorKey, string> = {
  customer: 'return-customer',
  units: 'return-units',
  shippingCompanyId: 'shippingCompanyId',
  governorateOption: 'governorate',
  cityOption: 'city',
  address: 'return-address',
};

const matchLocationOption = (
  options: LocationOption[] | undefined,
  stored: string | null | undefined,
): LocationOption | null => {
  const wanted = stored?.trim();
  if (!options || !wanted) return null;
  const normalizedWanted = normalizeArabic(wanted);
  return (
    options.find((option) => option.value === wanted) ??
    options.find((option) => option.label.trim() === wanted) ??
    options.find(
      (option) =>
        normalizeArabic(option.label) === normalizedWanted ||
        normalizeArabic(option.value) === normalizedWanted,
    ) ??
    null
  );
};

function CustomerReturnForm() {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] =
    useState<ReadonlySet<number>>(EMPTY_SELECTED_IDS);
  const [draft, setDraft] = useState<ReturnDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ReturnErrors>({});
  const [attention, setAttention] = useState<{
    orderId: number;
    code: string;
  } | null>(null);
  const candidatesQuery = useCustomerReturnCandidates(customer?.id ?? null);
  const createReturn = useCreateCustomerReturn();
  const { shippingCompanies } = useShippingCompanies(true);
  const orders = candidatesQuery.data?.orders ?? [];
  const lastAddress = candidatesQuery.data?.customer.lastAddress ?? null;

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
        lastAddress?.governorate,
      ),
    [governoratesQuery.data, lastAddress],
  );
  const matchedCity = useMemo(
    () => matchLocationOption(citiesQuery.data?.options, lastAddress?.city),
    [citiesQuery.data, lastAddress],
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
  const selectedCarrier = carrierSupportById[draft.shippingCompanyId] ?? null;
  const selectedCompanyName =
    selectedCarrier?.name ??
    shippingCompanies.find(
      (company) => String(company.id) === draft.shippingCompanyId,
    )?.name ??
    null;

  useEffect(() => {
    if (!lastAddress) return;
    setDraft((current) => ({
      ...current,
      address: lastAddress.address ?? '',
      area: lastAddress.area ?? '',
    }));
  }, [lastAddress]);

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

  const handleCustomerChange = (next: Customer | null) => {
    setCustomer(next);
    setAttention(null);
    setSelectedIds(EMPTY_SELECTED_IDS);
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
      address: undefined,
      governorateOption: undefined,
      cityOption: undefined,
    }));
  };

  const handleToggleUnit = (orderProductId: number) => {
    setErrors((current) => ({ ...current, units: undefined }));
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderProductId)) next.delete(orderProductId);
      else next.add(orderProductId);
      return next;
    });
  };

  const handleToggleOrder = (orderProductIds: number[], select: boolean) => {
    setErrors((current) => ({ ...current, units: undefined }));
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
    if (!customer) next.customer = t('customerReturn.customer.required');
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
    if (!customer) return;

    setAttention(null);
    const notes = draft.notes.trim();
    const area = draft.area.trim();
    createReturn.mutate(
      {
        customerId: customer.id,
        orderProductIds: selectedUnits.map((unit) => unit.orderProductId),
        confirm: !draft.needsConfirmation,
        shippingCompanyId: companyId,
        governorateOption: draft.governorateOption,
        cityOption: draft.cityOption,
        address: draft.address.trim(),
        ...(area && { area }),
        ...(notes && { notes }),
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
          setDraft((current) => ({ ...current, notes: '' }));
          setErrors({});
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
    if (!customer) {
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
    customer !== null || selectedIds.size > 0 || draft.address !== '';
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

      <div className="flex flex-col gap-[26px] lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6">
        <div className="flex min-w-0 flex-col gap-[26px]">
          <div className={CARD_CLASS}>
            <h1 className="font-bold text-[22px]">
              {t('customerReturn.customer.label')}
            </h1>
            <CustomerPicker
              id="return-customer"
              value={customer}
              onChange={handleCustomerChange}
              error={errors.customer}
            />
          </div>

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

        <aside className="flex min-w-0 flex-col gap-[26px] lg:sticky lg:top-4">
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
              refundValue={refundValue}
              shippingCompanyName={selectedCompanyName}
              carrier={selectedCarrier}
              pickupAddress={draft.address.trim()}
            />
          </div>
        </aside>
      </div>

      <StickyFormFooter
        isDirty={isDirty}
        isSaving={isPending}
        className="border-border shadow-[0_-4px_12px_rgb(0_0_0/0.06)] dark:shadow-none"
        status={
          isPending ? (
            t('customerReturn.submit.statusSaving')
          ) : missingStatus ? (
            <span className="font-medium text-destructive">{missingStatus}</span>
          ) : isDirty ? (
            t('customerReturn.submit.statusDirty')
          ) : (
            t('customerReturn.submit.status')
          )
        }
      >
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
          loadingText={t('customerReturn.submit.loading')}
          className="min-h-10 min-w-40 rounded-full font-bold"
        >
          <LiaPlusSolid className="w-5 h-5 text-primary-foreground" />
          {t('customerReturn.submit.button')}
        </Button>
      </StickyFormFooter>
    </form>
  );
}

export default CustomerReturnForm;
