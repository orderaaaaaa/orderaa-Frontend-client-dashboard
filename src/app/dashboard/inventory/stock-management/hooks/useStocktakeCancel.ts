'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { useCancelStocktakeMutation } from '@/services/stocktake';
import { getStocktakeErrorMessage } from '../utils/stocktakeErrors';

export function useStocktakeCancel(stocktakeId: number) {
  const cancelStocktake = useCancelStocktakeMutation();
  const [cancelOpen, setCancelOpen] = useState(false);

  const onCancel = () => {
    cancelStocktake.mutate(stocktakeId, {
      onSuccess: () => {
        toast.success('تم إلغاء جلسة الجرد');
        setCancelOpen(false);
      },
      onError: (err: unknown) => {
        toast.error(getStocktakeErrorMessage(err, 'تعذر إلغاء الجلسة'));
        setCancelOpen(false);
      },
    });
  };

  return { cancelOpen, setCancelOpen, onCancel, cancelStocktake };
}
