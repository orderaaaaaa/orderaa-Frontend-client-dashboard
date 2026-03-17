'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { ReceiptsContent } from './components';

function ReceiptsLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الاستلامات..." />
    </div>
  );
}

export default function ReceiptsPage() {
  return (
    <Suspense fallback={<ReceiptsLoading />}>
      <ReceiptsContent />
    </Suspense>
  );
}
