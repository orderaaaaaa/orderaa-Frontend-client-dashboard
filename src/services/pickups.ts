import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import http from '@/lib/api/http';

/** Mirrors the backend pickup read DTOs (T12). */
export interface PickupCard {
  id: number;
  code: string;
  shipmentPickupCode: string | null;
  /** The operation date the card shows from the outside. */
  createdAt: string;
  /** Optional — a pickup may have been submitted without a receipt. */
  receiptImageUrl: string | null;
  ordersCount: number;
  submittedByName: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
}

export interface PickupOrder {
  orderId: number;
  code: string;
  /** The order's CURRENT status; it may have moved past WAITING_FOR_APPROVAL. */
  status: string | null;
  customerName: string | null;
  totalCost: number | null;
  governorate: string | null;
  city: string | null;
  shippingCompany: string | null;
  isDeleted: boolean;
}

export interface PickupDetail extends PickupCard {
  orders: PickupOrder[];
}

const KEY = 'pickups';

export const usePickupsQuery = (params: {
  reviewed?: boolean;
  page?: number;
  limit?: number;
}) =>
  useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: async () => {
      const { data } = await http.get<{
        data: PickupCard[];
        page: number;
        limit: number;
        total: number;
      }>('/orders/pickups', { params });
      return data;
    },
  });

export const usePickupQuery = (id: number | undefined) =>
  useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: async () => {
      const { data } = await http.get<PickupDetail>(`/orders/pickups/${id}`);
      return data;
    },
    enabled: !!id,
  });

/** Idempotent server-side: re-reviewing keeps the original reviewer. */
export const useReviewPickup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await http.patch<PickupDetail>(
        `/orders/pickups/${id}/review`,
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
