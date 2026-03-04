'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_SUPPLIERS } from '../constants';
import { SupplierDetailContent } from './components';

function SupplierDetailPage() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const supplier = MOCK_SUPPLIERS.find((s) => s.id === Number(supplierId));

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-lg font-semibold text-gray-400">
          المورد غير موجود
        </p>
      </div>
    );
  }

  return <SupplierDetailContent supplier={supplier} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SupplierDetailPage />
    </Suspense>
  );
}
