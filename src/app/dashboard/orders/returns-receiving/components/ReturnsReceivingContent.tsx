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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isStep1Valid, setIsStep1Valid] = useState(false);

  const submitMutation = useSubmitReturnReceiptsMutation();

  const handleValidityChange = useCallback((valid: boolean) => {
    setIsStep1Valid(valid);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!imageUrl || mainScanCodes.length === 0) return;
    try {
      await submitMutation.mutateAsync({
        orderCodes: mainScanCodes,
        imageUrl,
      });
      router.replace('/dashboard/orders/allOrders');
    } catch {
      /* error toast handled by mutation onError */
    }
  }, [mainScanCodes, imageUrl, submitMutation, router]);

  return (
    <div className="flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full min-h-full">
      <Breadcrumb
        items={[{ title: 'الطلبات' }, { title: 'استلامات المرتجعات' }]}
      />

      <Step1Receive
        onValidityChange={handleValidityChange}
        onScanCodesChange={setMainScanCodes}
        onImageUrlChange={setImageUrl}
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
