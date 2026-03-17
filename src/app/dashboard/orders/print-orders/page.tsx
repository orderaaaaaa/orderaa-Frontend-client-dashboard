'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { PrintOrdersContent } from './components/PrintOrdersContent';

function PrintOrdersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الطلبات..." />
    </div>
  );
}

export default function PrintOrdersPage() {
  return (
    <Suspense fallback={<PrintOrdersLoading />}>
      <PrintOrdersContent />
    </Suspense>
  );
}
