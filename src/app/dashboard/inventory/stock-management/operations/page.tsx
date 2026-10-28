'use client';

import { Suspense } from 'react';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { EmptyState } from '@/components/ui/state-panels';
import PageLoading from '@/components/ui/page-loading';
import { PERMISSION_CODES } from '@/lib/permissions';
import { OperationsContent } from './components/OperationsContent';

function StockOperationsGate() {
  const canView = useHasPermissionStrict(PERMISSION_CODES.PRODUCTS_STOCK_READ);

  if (!canView) {
    return (
      <EmptyState
        title="ليس لديك صلاحية عرض عمليات المخزون"
        description="اطلب من مدير الحساب صلاحية عرض المخزون"
      />
    );
  }

  return <OperationsContent />;
}

export default function StockOperationsPage() {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden p-4">
      <Suspense fallback={<PageLoading message="جاري التحميل..." />}>
        <StockOperationsGate />
      </Suspense>
    </div>
  );
}
