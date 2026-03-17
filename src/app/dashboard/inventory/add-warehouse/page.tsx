'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { AddWarehouseContent } from './components';

function AddWarehouseLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

export default function AddWarehousePage() {
  return (
    <Suspense fallback={<AddWarehouseLoading />}>
      <AddWarehouseContent />
    </Suspense>
  );
}
