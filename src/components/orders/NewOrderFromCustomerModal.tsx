'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import BaseModal from '@/components/ui/base-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { UnsavedChangesDialog } from '@/components/ui/unsaved-changes-dialog';
import {
  NewOrderForm,
  type ManualOrderPreset,
} from '@/app/dashboard/upload-products/manual/NewOrderForm';
import type { Customer as CustomerListItem } from '@/app/dashboard/customers/types/customer';
import { ORDER_LOOKUP_SURFACE } from '@/constants/orderReadScope';
import type { CreateOrderResponse } from '@/types/manual-order';
import type { Order } from '@/types/orders';
import {
  droppedSuffixOf,
  locationRefOf,
  resolveLatestOrderFill,
  validateLocationPreset,
  type LocationPresetDropped,
  type LocationPresetResult,
} from '@/utils/latestOrderFill';

type NewOrderSource =
  | { kind: 'order'; order: Order }
  | { kind: 'customer'; customer: CustomerListItem };

interface NewOrderFromCustomerModalProps {
  open: boolean;
  onClose: () => void;
  source: NewOrderSource;
  onCreated?: (created: CreateOrderResponse) => void;
}

const presetOf = (
  name: string,
  phones: string[],
  address: string | undefined,
  location: LocationPresetResult,
): ManualOrderPreset => ({
  name,
  phoneNumbers: phones.slice(0, 2),
  address: address ?? '',
  shippingCompanyId:
    location.shippingCompanyId !== undefined ? String(location.shippingCompanyId) : undefined,
  governorateOption: location.governorateOption,
  cityOption: location.cityOption,
});

const warnDropped = (code: string, dropped: LocationPresetDropped[]) => {
  if (dropped.length === 0) return;
  toast.warning(`تم ملء البيانات من الطلب ${code}${droppedSuffixOf(dropped)}`);
};

const resolveFromOrder = async (
  queryClient: QueryClient,
  order: Order,
): Promise<ManualOrderPreset> => {
  const location = await validateLocationPreset(queryClient, {
    shippingCompanyId: order.shippingCompanyId,
    governorate: locationRefOf(order.governorateOption, order.governorateSourceRowId, order.governorate),
    city: locationRefOf(order.cityOption, order.citySourceRowId, order.city),
  });
  warnDropped(order.code, location.dropped);
  return presetOf(
    order.customers.name,
    order.customers.phone_numbers,
    order.address,
    location,
  );
};

const resolveFromCustomer = async (
  queryClient: QueryClient,
  customer: CustomerListItem,
): Promise<ManualOrderPreset> => {
  const phone = customer.phoneNumbers[0];
  const fill = phone
    ? await resolveLatestOrderFill(
        queryClient,
        phone,
        { customerId: customer.id },
        ORDER_LOOKUP_SURFACE.MANUAL_ORDER_CLIENT_HISTORY,
      )
    : null;
  if (!fill) {
    return { name: customer.name, phoneNumbers: customer.phoneNumbers.slice(0, 2) };
  }
  warnDropped(fill.row.code, fill.dropped);
  return presetOf(fill.name, customer.phoneNumbers, fill.address, fill);
};

const skeleton = (
  <div className="flex flex-col gap-4">
    <Skeleton className="h-12 bg-muted border border-border/60" />
    <Skeleton className="h-32 bg-muted border border-border/60" />
    <Skeleton className="h-32 bg-muted border border-border/60" />
  </div>
);

export default function NewOrderFromCustomerModal({
  open,
  onClose,
  source,
  onCreated,
}: NewOrderFromCustomerModalProps) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  const sourceId = source.kind === 'order' ? source.order.id : source.customer.id;
  const presetQuery = useQuery({
    queryKey: ['new-order-preset', source.kind, sourceId],
    queryFn: () =>
      source.kind === 'order'
        ? resolveFromOrder(queryClient, source.order)
        : resolveFromCustomer(queryClient, source.customer),
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  const requestClose = () => {
    if (pending) return;
    if (dirty) {
      setConfirmLeaveOpen(true);
      return;
    }
    onClose();
  };

  const handleCreated = (created: CreateOrderResponse) => {
    onCreated?.(created);
    onClose();
  };

  const renderBody = () => {
    if (presetQuery.data) {
      return (
        <NewOrderForm
          variant="modal"
          preset={presetQuery.data}
          onCreated={handleCreated}
          onPendingChange={setPending}
          onDirtyChange={setDirty}
        />
      );
    }
    if (presetQuery.isError) {
      return (
        <ErrorState
          error={presetQuery.error}
          fallback="تعذر تحميل بيانات الطلب"
          onRetry={() => void presetQuery.refetch()}
        />
      );
    }
    return skeleton;
  };

  return (
    <>
      <BaseModal
        isOpen={open}
        onClose={requestClose}
        title="طلب جديد"
        showFooter={false}
        isLoading={pending}
        maxWidth="md:max-w-5xl"
      >
        {renderBody()}
      </BaseModal>
      <UnsavedChangesDialog
        isOpen={confirmLeaveOpen}
        onStay={() => setConfirmLeaveOpen(false)}
        onLeave={() => {
          setConfirmLeaveOpen(false);
          onClose();
        }}
        message="إذا أغلقت النافذة الآن ستفقد بيانات الطلب التي أدخلتها."
      />
    </>
  );
}
