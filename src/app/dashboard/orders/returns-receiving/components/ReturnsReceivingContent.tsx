'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumb } from '@/components/dashboard-layout/Breadcrumb';
import { Step1Receive } from './Step1Receive';
import { WizardFooter } from './WizardFooter';
import { useSubmitReturnReceiptsMutation } from '../hooks/useReturnsMutations';

export function ReturnsReceivingContent() {
  const router = useRouter();

  const [mainScanCodes, setMainScanCodes] = useState<string[]>([]);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [codeSheetImageUrls, setCodeSheetImageUrls] = useState<string[]>([]);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const submitMutation = useSubmitReturnReceiptsMutation();

  const handleValidityChange = useCallback((valid: boolean) => {
    setIsStep1Valid(valid);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!receiptImageUrl || mainScanCodes.length === 0) return;
    try {
      await submitMutation.mutateAsync({
        orderCodes: mainScanCodes,
        receiptImageUrl,
        codeSheetImageUrls: codeSheetImageUrls.length > 0 ? codeSheetImageUrls : undefined,
      });
      router.replace('/dashboard/orders/allOrders');
    } catch {
      /* error toast handled by mutation onError */
    }
  }, [mainScanCodes, receiptImageUrl, codeSheetImageUrls, submitMutation, router]);

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[{ title: 'الطلبات' }, { title: 'استلامات المرتجعات' }]}
      />

      <Step1Receive
        onValidityChange={handleValidityChange}
        onScanCodesChange={setMainScanCodes}
        onImageUrlChange={setReceiptImageUrl}
        onCodeSheetUrlsChange={setCodeSheetImageUrls}
      />

      <div className="p-4 sm:p-6">
        <WizardFooter
          isStep1Valid={isStep1Valid}
          isSubmitting={submitMutation.isPending}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
