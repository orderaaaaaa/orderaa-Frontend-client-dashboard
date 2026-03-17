'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { StockManagementContent } from './components';

function StockManagementLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل بيانات المخزن..." />
    </div>
  );
}

export default function StockManagementPage() {
  return (
    <Suspense fallback={<StockManagementLoading />}>
      <StockManagementContent />
    </Suspense>
  );
}
