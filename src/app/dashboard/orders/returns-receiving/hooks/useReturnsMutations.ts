'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  mockCommitFinalReturns,
  mockUploadReceiptProof,
  mockUpdateReturnCategories,
  mockGenerateResendCodes,
} from '../services';
import type {
  CategorizeCommitPayload,
  UploadReceiptProofPayload,
} from '../types';

function pickErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const anyErr = err as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      anyErr.response?.data?.message ?? anyErr.message ?? fallback
    );
  }
  return fallback;
}

export function useCommitFinalReturnsMutation() {
  return useMutation({
    mutationFn: (codes: string[]) => mockCommitFinalReturns(codes),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر تحديث المرتجعات النهائية'));
    },
  });
}

export function useUploadReceiptProofMutation() {
  return useMutation({
    mutationFn: (payload: UploadReceiptProofPayload) =>
      mockUploadReceiptProof(payload),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر رفع صور الإثبات'));
    },
  });
}

export function useUpdateReturnCategoriesMutation() {
  return useMutation({
    mutationFn: (payload: CategorizeCommitPayload) =>
      mockUpdateReturnCategories(payload),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر إتمام عملية التقسيم'));
    },
  });
}

export function useGenerateResendCodesMutation() {
  return useMutation({
    mutationFn: (orderCodes: string[]) => mockGenerateResendCodes(orderCodes),
    onError: (err) => {
      toast.error(pickErrorMessage(err, 'تعذر توليد أكواد إعادة الإرسال'));
    },
  });
}
