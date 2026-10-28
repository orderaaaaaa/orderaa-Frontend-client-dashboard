'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { ReceiptDetailContent } from './components';

function ReceiptDetailLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <PageLoading message="جاري تحميل تفاصيل الاستلام..." />
    </div>
  );
}

export default function ReceiptDetailPage({
  params,
}: {
  params: { receiptId: string };
}) {
  const { receiptId } = params;
  const canRead = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_READ);

  if (!canRead) {
    return <EmptyState title="ليست لديك صلاحية عرض الاستلامات" />;
  }

  return (
    <Suspense fallback={<ReceiptDetailLoading />}>
      <ReceiptDetailContent receiptId={receiptId} />
    </Suspense>
  );
}
