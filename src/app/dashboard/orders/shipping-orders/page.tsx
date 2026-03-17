'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { ShippingOrdersContent } from './components/ShippingOrdersContent';

function ShippingOrdersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الطلبات..." />
    </div>
  );
}

export default function ShippingOrdersPage() {
  return (
    <Suspense fallback={<ShippingOrdersLoading />}>
      <ShippingOrdersContent />
    </Suspense>
  );
}
