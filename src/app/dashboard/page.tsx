'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { DashboardContent } from './components';

function DashboardLoading() {
  return (
    <div className="w-full">
      <PageLoading message="جاري تحميل لوحة التحكم..." />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
