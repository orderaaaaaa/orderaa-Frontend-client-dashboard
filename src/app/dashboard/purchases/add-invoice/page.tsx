'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { AddInvoiceContent } from './components';

function AddInvoiceLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

export default function AddInvoicePage() {
  return (
    <Suspense fallback={<AddInvoiceLoading />}>
      <AddInvoiceContent />
    </Suspense>
  );
}
