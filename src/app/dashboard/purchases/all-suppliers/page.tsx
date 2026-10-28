'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { AllSuppliersContent } from './components';

function AllSuppliersLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الموردين..." />
    </div>
  );
}

export default function AllSuppliersPage() {
  const canRead = useHasPermissionStrict(PERMISSION_CODES.SUPPLIERS_READ);

  if (!canRead) {
    return <EmptyState title="ليست لديك صلاحية عرض الموردين" />;
  }

  return (
    <Suspense fallback={<AllSuppliersLoading />}>
      <AllSuppliersContent />
    </Suspense>
  );
}
