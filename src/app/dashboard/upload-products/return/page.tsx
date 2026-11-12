'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLoading from '@/components/ui/page-loading';
import { useI18n } from '@/i18n/I18nProvider';
import CustomerReturnForm from './CustomerReturnForm';

const CUSTOMER_ID_PATTERN = /^[1-9]\d*$/;

function CustomerReturnLoading() {
  const { t } = useI18n();
  return <PageLoading message={t('common.loading')} />;
}

function CustomerReturnRoute() {
  const searchParams = useSearchParams();
  const rawCustomerId = searchParams.get('customerId');
  const initialCustomerId =
    rawCustomerId !== null && CUSTOMER_ID_PATTERN.test(rawCustomerId)
      ? Number(rawCustomerId)
      : undefined;
  return (
    <CustomerReturnForm
      key={initialCustomerId ?? 'new'}
      initialCustomerId={initialCustomerId}
    />
  );
}

function CustomerReturnPage() {
  return (
    <Suspense fallback={<CustomerReturnLoading />}>
      <CustomerReturnRoute />
    </Suspense>
  );
}

export default CustomerReturnPage;
