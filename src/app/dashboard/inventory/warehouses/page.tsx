'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { WarehouseManagementContent } from './components';

function WarehousesLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري التحميل..." />
    </div>
  );
}

export default function WarehousesPage() {
  return (
    <Suspense fallback={<WarehousesLoading />}>
      <WarehouseManagementContent />
    </Suspense>
  );
}
