'use client';

import { AuditHistoryList } from '@/components/audit/AuditHistoryList';
import { ErrorState } from '@/components/ui/state-panels';
import { useSupplierInvoiceHistoryQuery } from '@/services/suppliers';
import type { InvoiceProductApiItem, SupplierInvoiceEvent } from '@/lib/api/suppliers';
import { InvoiceHistoryBody } from './InvoiceHistoryBody';

const ACTION_LABEL: Record<SupplierInvoiceEvent['action'], string> = {
  CREATED: 'إنشاء الفاتورة',
  UPDATED: 'تعديل الفاتورة',
  ATTRIBUTED: 'تغيير المنشئ',
  APPROVED: 'اعتماد الفاتورة',
  CLOSED: 'إغلاق الفاتورة',
  REVERSED: 'عكس الدفعة',
  DELETED: 'حذف الفاتورة',
};

interface InvoiceHistoryTabProps {
  invoiceId: number;
  products: InvoiceProductApiItem[];
}

export function InvoiceHistoryTab({ invoiceId, products }: InvoiceHistoryTabProps) {
  const query = useSupplierInvoiceHistoryQuery(invoiceId);

  if (query.isError) {
    return (
      <ErrorState
        error={query.error}
        fallback="تعذّر تحميل سجل الفاتورة"
        onRetry={() => void query.refetch()}
      />
    );
  }

  const events = query.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <AuditHistoryList
      items={events}
      hasNext={query.hasNextPage}
      isLoading={query.isPending || query.isFetchingNextPage}
      onLoadMore={() => void query.fetchNextPage()}
      getActor={(event) => event.actor}
      getAction={(event) => ACTION_LABEL[event.action]}
      getCreatedAt={(event) => event.createdAt}
      renderBody={(event) => <InvoiceHistoryBody event={event} products={products} />}
      emptyTitle="لا يوجد سجل لهذه الفاتورة"
    />
  );
}
