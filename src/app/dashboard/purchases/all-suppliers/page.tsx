'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { AllSuppliersContent } from './components';

function AllSuppliersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الموردين..." />
    </div>
  );
}

export default function AllSuppliersPage() {
  return (
    <Suspense fallback={<AllSuppliersLoading />}>
      <AllSuppliersContent />
    </Suspense>
  );
}
