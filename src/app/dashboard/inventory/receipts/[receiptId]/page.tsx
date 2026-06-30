'use client';

import { Suspense } from 'react';
import PageLoading from '@/components/ui/page-loading';
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

  return (
    <Suspense fallback={<ReceiptDetailLoading />}>
      <ReceiptDetailContent receiptId={receiptId} />
    </Suspense>
  );
}
