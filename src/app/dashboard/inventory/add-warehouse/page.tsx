'use client';

import { Suspense } from 'react';
import { AddWarehouseContent } from './components';

function AddWarehouseLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
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
