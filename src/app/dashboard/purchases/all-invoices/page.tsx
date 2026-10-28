'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { AllInvoicesContent } from './components';

function AllInvoicesLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل الفواتير..." />
    </div>
  );
}

export default function AllInvoicesPage() {
  const canRead = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_READ);

  if (!canRead) {
    return <EmptyState title="ليست لديك صلاحية عرض فواتير الموردين" />;
  }

  return (
    <Suspense fallback={<AllInvoicesLoading />}>
      <AllInvoicesContent />
    </Suspense>
  );
}
