'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { LiaPlusSolid } from 'react-icons/lia';
import { toast } from 'react-toastify';
import CustomerPicker from '@/components/customers/CustomerPicker';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { Skeleton } from '@/components/ui/skeleton';
import { StickyFormFooter } from '@/components/ui/sticky-form-footer';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/i18n/I18nProvider';
import {
  useCreateCustomerReturn,
  useCustomerReturnCandidates,
} from '@/services/customerReturns';
import { shippingCompanyIdOf } from '@/lib/shippingCompanies';
import { getApiErrorMessage } from '@/utils/apiError';
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

const EMPTY_DRAFT: ReturnDraft = {
  shippingCompanyId: '',
  governorateOption: '',
  cityOption: '',
  address: '',
  notes: '',
  needsConfirmation: false,
};

const ERROR_FIELD_IDS: Record<ReturnErrorKey, string> = {
  customer: 'return-customer',
  units: 'return-units',
  shippingCompanyId: 'shippingCompanyId',
  governorateOption: 'governorate',
  cityOption: 'city',
  address: 'return-address',
};

function CustomerReturnForm() {
  const { t } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    new Set(),
  );
  const [draft, setDraft] = useState<ReturnDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ReturnErrors>({});
  const candidatesQuery = useCustomerReturnCandidates(customer?.id ?? null);
  const createReturn = useCreateCustomerReturn();
  const orders = candidatesQuery.data?.orders ?? [];
  const lastAddress = candidatesQuery.data?.customer.lastAddress;

  const carrierSupportById = useMemo(() => {
    const map: Record<string, CarrierSupportState & { name: string }> = {};
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

  useEffect(() => {
    if (!lastAddress) return;
    setDraft((current) => ({
      ...current,
      governorateOption: lastAddress.governorateOption,
      cityOption: lastAddress.cityOption,
      address: lastAddress.address,
    }));
  }, [lastAddress]);

  const updateDraft = (patch: Partial<ReturnDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    const cleared: ReturnErrors = {};
    (Object.keys(patch) as (keyof ReturnDraft)[]).forEach((key) => {
      if (key in ERROR_FIELD_IDS) cleared[key as ReturnErrorKey] = undefined;
    });
    setErrors((current) => ({ ...current, ...cleared }));
  };

  const handleCustomerChange = (next: Customer | null) => {
    setCustomer(next);
    setSelectedIds(new Set());
    setErrors((current) => ({
      ...current,
      customer: undefined,
      units: undefined,
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

  const resetForm = () => {
    setCustomer(null);
    setSelectedIds(new Set());
    setDraft(EMPTY_DRAFT);
    setErrors({});
  };

  const validate = (): ReturnErrors => {
    const next: ReturnErrors = {};
    if (!customer) next.customer = t('customerReturn.customer.required');
    if (selectedUnits.length === 0)
      next.units = t('customerReturn.errors.units');
    if (!draft.shippingCompanyId)
      next.shippingCompanyId = t('customerReturn.errors.company');
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
    if (firstError || !customer) {
      if (firstError) {
        document
          .querySelector(`[data-field-error="${ERROR_FIELD_IDS[firstError]}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const notes = draft.notes.trim();
    createReturn.mutate(
      {
        customerId: customer.id,
        orderProductIds: selectedUnits.map((unit) => unit.orderProductId),
        confirm: !draft.needsConfirmation,
        shippingCompanyId:
          shippingCompanyIdOf(draft.shippingCompanyId) ?? undefined,
        governorateOption: draft.governorateOption,
        cityOption: draft.cityOption,
        address: draft.address.trim(),
        ...(notes && { notes }),
      },
      {
        onSuccess: (created) => {
          toast.success(
            t('customerReturn.submit.success', { code: created.code }),
          );
          resetForm();
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
          <Skeleton className="h-32 bg-muted" />
          <Skeleton className="h-32 bg-muted" />
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
      return <EmptyState title={t('customerReturn.orders.empty')} />;
    }
    return (
      <div className="flex flex-col gap-3">
        <ReturnSourceOrders
          orders={orders}
          selectedIds={selectedIds}
          onToggleUnit={handleToggleUnit}
          onToggleOrder={handleToggleOrder}
        />
        {errors.units && <p className="text-sm text-red-500">{errors.units}</p>}
      </div>
    );
  };

  const isDirty =
    customer !== null || selectedIds.size > 0 || draft.address !== '';
  const isPending = createReturn.isPending;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="flex flex-col gap-[26px]"
    >
      <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
        <div className="flex w-full flex-col gap-4 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
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
      </div>

      <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
        <div className="flex w-full flex-col gap-6 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
          <h2 className="font-bold text-[19px]">
            {t('customerReturn.orders.title')}
          </h2>
          <div data-field-error="return-units">{renderOrders()}</div>
        </div>
      </div>

      <ShippingSection
        mode="return"
        carrierSupport={carrierSupportById}
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

      <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
        <div className="flex w-full flex-col gap-6 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
          <div
            data-field-error="return-address"
            className="flex flex-col gap-2"
          >
            <label
              htmlFor="return-address-input"
              className="font-medium text-[16px]"
            >
              {t('customerReturn.address.label')}{' '}
              <span className="text-red-500">*</span>
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
              <p className="text-sm text-red-500">{errors.address}</p>
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

      <ConfirmationSection
        description={t('customerReturn.confirm.description')}
        needsConfirmation={draft.needsConfirmation}
        onNeedsConfirmationChange={(v) => updateDraft({ needsConfirmation: v })}
      />

      <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
        <div className="flex w-full flex-col gap-6 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
          <h2 className="font-bold text-[19px]">
            {t('customerReturn.summary.title')}
          </h2>
          <ReturnSummaryPanel
            unitsCount={selectedUnits.length}
            refundValue={refundValue}
            shippingCompanyName={selectedCarrier?.name ?? null}
            carrier={selectedCarrier}
            pickupAddress={draft.address.trim()}
          />
        </div>
      </div>

      <StickyFormFooter
        isDirty={isDirty}
        isSaving={isPending}
        status={
          isPending
            ? t('customerReturn.submit.statusSaving')
            : isDirty
              ? t('customerReturn.submit.statusDirty')
              : t('customerReturn.submit.status')
        }
      >
        <Button
          type="submit"
          disabled={isPending}
          loading={isPending}
          loadingText={t('customerReturn.submit.loading')}
          className="min-h-10 min-w-40 rounded-full font-bold"
        >
          <LiaPlusSolid className="w-5 h-5 text-white" />
          {t('customerReturn.submit.button')}
        </Button>
      </StickyFormFooter>
    </form>
  );
}

export default CustomerReturnForm;
