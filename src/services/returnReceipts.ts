import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';

/** Mirrors the backend return-receipt read DTOs (T26). */
export interface ReturnReceiptCard {
  id: number;
  /** The "operation date" the card shows from the outside. */
  createdAt: string;
  receiptImageUrl: string | null;
  codeSheetImageUrls: string[];
  notes: string | null;
  ordersCount: number;
  receivedByName: string | null;
  /** NULL means not reviewed — there is no separate boolean. */
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export interface ReturnReceiptOrder {
  orderId: number;
  code: string;
  status: string | null;
  customerName: string | null;
  totalCost: number | null;
  governorate: string | null;
  city: string | null;
  productsCount: number;
  isDeleted: boolean;
}

export interface ReturnReceiptDetail extends ReturnReceiptCard {
  orders: ReturnReceiptOrder[];
}

const KEY = 'return-receipts';

export const useReturnReceiptsQuery = (params: {
  reviewed?: boolean;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await http.get<{
        data: ReturnReceiptCard[];
        page: number;
        limit: number;
        total: number;
      }>('/orders/return-receipts', { params });
      return data;
    },
  });

export const useReturnReceiptQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: async () => {
      const { data } = await http.get<ReturnReceiptDetail>(
        `/orders/return-receipts/${id}`,
      );
      return data;
    },
    enabled: !!id,
  });

/** Idempotent server-side: re-reviewing keeps the original reviewer. */
export const useReviewReturnReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.patch<ReturnReceiptDetail>(
        `/orders/return-receipts/${id}/review`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY] });
      toast.success('تم تسجيل المراجعة');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'تعذر تسجيل المراجعة');
    },
  });
};
