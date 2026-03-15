'use client';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MOCK_RECEIPTS } from '../constants';
import { ReceiptDetailContent } from './components';

function ReceiptDetailLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الاستلام...</p>
        </div>
      </div>
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
