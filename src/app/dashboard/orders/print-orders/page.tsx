'use client';

import { Suspense } from 'react';
import { PrintOrdersContent } from './components/PrintOrdersContent';

function PrintOrdersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
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
