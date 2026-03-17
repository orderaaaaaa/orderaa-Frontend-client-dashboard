'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { AddSupplierContent } from './components';

function AddSupplierLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

export default function AddSupplierPage() {
  return (
    <Suspense fallback={<AddSupplierLoading />}>
      <AddSupplierContent />
    </Suspense>
  );
}
