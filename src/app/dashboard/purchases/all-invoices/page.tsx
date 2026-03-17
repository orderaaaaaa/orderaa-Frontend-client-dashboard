'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { AllInvoicesContent } from './components';

function AllInvoicesLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الفواتير..." />
    </div>
  );
}

export default function AllInvoicesPage() {
  return (
    <Suspense fallback={<AllInvoicesLoading />}>
      <AllInvoicesContent />
    </Suspense>
  );
}
