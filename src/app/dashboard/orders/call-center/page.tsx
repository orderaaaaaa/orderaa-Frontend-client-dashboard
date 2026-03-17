'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { CallCenterContent } from './components/CallCenterContent';

function CallCenterLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الطلبات..." />
    </div>
  );
}

export default function CallCenterPage() {
  return (
    <Suspense fallback={<CallCenterLoading />}>
      <CallCenterContent />
    </Suspense>
  );
}
