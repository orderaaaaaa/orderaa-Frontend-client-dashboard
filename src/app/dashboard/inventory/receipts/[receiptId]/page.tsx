'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PageLoading from '@/components/ui/page-loading';
import { MOCK_RECEIPTS } from '../constants';
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
  const receipt = MOCK_RECEIPTS.find((r) => r.id === Number(receiptId));

  if (!receipt) {
    notFound();
  }

  return (
    <Suspense fallback={<ReceiptDetailLoading />}>
      <ReceiptDetailContent
        receiptId={receiptId}
        receipt={{
          invoiceNumber: receipt.invoiceNumber,
          companyName: receipt.companyName,
        }}
      />
    </Suspense>
  );
}
