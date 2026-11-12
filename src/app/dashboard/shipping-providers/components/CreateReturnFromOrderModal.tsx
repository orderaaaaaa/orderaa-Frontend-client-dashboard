'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CustomerReturnForm from '@/app/dashboard/upload-products/return/CustomerReturnForm';
import BaseModal from '@/components/ui/base-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import { orderDetailsQueryOptions } from '@/services/orders';
import { KEY as SHIPPING_PROVIDERS_KEY } from '@/services/shippingProviders';
import type {
  CreateCustomerReturnResponse,
  CustomerReturnPreset,
} from '@/types/customer-return';
import type { Order } from '@/types/orders';
import { carrierSendNeedsAttention } from '@/utils/manualOrder/carrierSend';

interface CreateReturnFromOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  orderCode: string;
}

const presetOf = (order: Order): CustomerReturnPreset => ({
  customerId: order.customerId,
  shippingCompanyId: order.shippingCompanyId ?? null,
  governorateOption: order.governorateOption ?? null,
  cityOption: order.cityOption ?? null,
  governorateName: order.governorate ?? '',
  cityName: order.city ?? '',
  address: order.address ?? '',
  area: order.area ?? '',
});

export default function CreateReturnFromOrderModal({
  isOpen,
  onClose,
  orderId,
  orderCode,
}: CreateReturnFromOrderModalProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const orderQuery = useQuery({ ...orderDetailsQueryOptions(orderId), enabled: isOpen });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const preset = useMemo(
    () => (orderQuery.data ? presetOf(orderQuery.data) : null),
    [orderQuery.data],
  );

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleCreated = (response: CreateCustomerReturnResponse) => {
    void queryClient.invalidateQueries({ queryKey: [SHIPPING_PROVIDERS_KEY] });
    if (carrierSendNeedsAttention(response.carrierSend)) return;
    onClose();
  };

  const renderBody = () => {
    if (orderQuery.isError) {
      return (
        <ErrorState
          error={orderQuery.error}
          fallback={t('inProcess.sheet.createReturnLoadError')}
          onRetry={() => void orderQuery.refetch()}
        />
      );
    }
    if (preset === null) {
      return (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-12 bg-muted border border-border/60" />
          <Skeleton className="h-32 bg-muted border border-border/60" />
          <Skeleton className="h-32 bg-muted border border-border/60" />
        </div>
      );
    }
    return (
      <CustomerReturnForm
        preset={preset}
        onCreated={handleCreated}
        onPendingChange={setIsSubmitting}
      />
    );
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('inProcess.sheet.createReturnTitle', { code: orderCode })}
      showFooter={false}
      isLoading={isSubmitting}
    >
      {renderBody()}
    </BaseModal>
  );
}
