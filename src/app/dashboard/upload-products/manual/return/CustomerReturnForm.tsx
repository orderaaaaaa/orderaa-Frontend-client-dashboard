'use client';

import React, { useState } from 'react';
import CustomerPicker from '@/components/customers/CustomerPicker';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/state-panels';
import { useI18n } from '@/i18n/I18nProvider';
import { useCustomerReturnCandidates } from '@/services/customerReturns';
import type { Customer } from '@/app/dashboard/customers/types/customer';
import ReturnSourceOrders from './ReturnSourceOrders';

function CustomerReturnForm() {
  const { t } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(new Set());
  const candidatesQuery = useCustomerReturnCandidates(customer?.id ?? null);
  const orders = candidatesQuery.data?.orders ?? [];

  const handleCustomerChange = (next: Customer | null) => {
    setCustomer(next);
    setSelectedIds(new Set());
  };

  const handleToggleUnit = (orderProductId: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(orderProductId)) next.delete(orderProductId);
      else next.add(orderProductId);
      return next;
    });
  };

  const handleToggleOrder = (orderProductIds: number[], select: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      orderProductIds.forEach((id) => (select ? next.add(id) : next.delete(id)));
      return next;
    });
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
      <ReturnSourceOrders
        orders={orders}
        selectedIds={selectedIds}
        onToggleUnit={handleToggleUnit}
        onToggleOrder={handleToggleOrder}
      />
    );
  };

  return (
    <div className="bg-muted/50 max-sm:px-0 px-6 flex items-center justify-center">
      <div className="flex w-full flex-col gap-6 bg-card border border-border rounded-xl max-sm:p-5 p-8 shadow-sm">
        <section className="flex flex-col gap-4">
          <h1 className="font-bold text-[22px]">{t('customerReturn.customer.label')}</h1>
          <CustomerPicker id="return-customer" value={customer} onChange={handleCustomerChange} />
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="font-bold text-[19px]">{t('customerReturn.orders.title')}</h2>
          {renderOrders()}
        </section>
      </div>
    </div>
  );
}

export default CustomerReturnForm;
