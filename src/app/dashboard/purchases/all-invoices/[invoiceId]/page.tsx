'use client';

import { useParams } from 'next/navigation';
import { EmptyState } from '@/components/ui/state-panels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { PERMISSION_CODES } from '@/lib/permissions';
import { InvoiceDetailContent } from './components';

export default function SupplierInvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.SUPPLIER_INVOICES_READ);

  if (!canRead) {
    return (
      <EmptyState title="ليست لديك صلاحية عرض فواتير الموردين" />
    );
  }

  return <InvoiceDetailContent invoiceId={Number(invoiceId)} />;
}
