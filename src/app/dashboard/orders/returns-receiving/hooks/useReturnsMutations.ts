'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { uploadFile } from '@/lib/api/upload';
import { submitReturnReceipts } from '@/lib/api/returns-receiving';
import {
  bulkUpdateReturnCategories,
  generateReturnResendCodes,
} from '../services';
import type {
  CategorizeCommitPayload,
  SubmitReturnReceiptsPayload,
} from '../types';

function pickErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const anyErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return anyErr.response?.data?.message ?? anyErr.message ?? fallback;
  }
  return fallback;
}

export function useUploadReceiptProofMutation() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر رفع صور الإثبات'));
    },
  });
}

export function useSubmitReturnReceiptsMutation() {
  return useMutation({
    mutationFn: (payload: SubmitReturnReceiptsPayload) =>
      submitReturnReceipts(payload),
    onSuccess: () => {
      toast.success('تم إتمام استلام المرتجعات بنجاح');
    },
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر إتمام استلام المرتجعات'));
    },
  });
}

export function useUpdateReturnCategoriesMutation() {
  return useMutation({
    mutationFn: (payload: CategorizeCommitPayload) =>
      bulkUpdateReturnCategories(payload),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر إتمام عملية التقسيم'));
    },
  });
}

export function useGenerateResendCodesMutation() {
  return useMutation({
    mutationFn: (orderCodes: string[]) => generateReturnResendCodes(orderCodes),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر توليد أكواد إعادة الإرسال'));
    },
  });
}

