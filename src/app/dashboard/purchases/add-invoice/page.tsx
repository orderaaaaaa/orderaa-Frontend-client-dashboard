'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PageLoading from '@/components/ui/page-loading';
import { AddInvoiceContent } from './components';

function AddInvoiceLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

function AddInvoiceRoute() {
  const searchParams = useSearchParams();
  const rawInvoiceId = searchParams.get('invoiceId');
  return <AddInvoiceContent invoiceId={rawInvoiceId === null ? undefined : Number(rawInvoiceId)} />;
}

export default function AddInvoicePage() {
  return (
    <Suspense fallback={<AddInvoiceLoading />}>
      <AddInvoiceRoute />
    </Suspense>
  );
}
