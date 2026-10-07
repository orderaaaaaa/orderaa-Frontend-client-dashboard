'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { WAREHOUSES_PAGE_ENABLED } from '@/constants/warehouses';
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
  if (!WAREHOUSES_PAGE_ENABLED) notFound();

  return (
    <Suspense fallback={<WarehousesLoading />}>
      <WarehouseManagementContent />
    </Suspense>
  );
}
