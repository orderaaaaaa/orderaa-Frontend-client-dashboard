import http from '@/lib/api/http';
import type {
  MarkNoticesReadDto,
  MarkNoticesReadResponseDto,
  OrderNoticesPageDto,
  UnreadNoticeCountDto,
} from '@/types/orderSystemFailures';

export const ORDER_NOTICES_PAGE_LIMIT = 20;

export async function getUnreadNoticeCount(): Promise<UnreadNoticeCountDto> {
  const { data } = await http.get<UnreadNoticeCountDto>('/orders/notices/unread-count');
  return data;
}

export async function getUnreadNotices(cursor?: number): Promise<OrderNoticesPageDto> {
  const { data } = await http.get<OrderNoticesPageDto>('/orders/notices', {
    params: { cursor, limit: ORDER_NOTICES_PAGE_LIMIT },
  });
  return data;
}

export async function getOrderNotices(orderId: number, cursor?: number): Promise<OrderNoticesPageDto> {
  const { data } = await http.get<OrderNoticesPageDto>(`/orders/${orderId}/notices`, {
    params: { cursor, limit: ORDER_NOTICES_PAGE_LIMIT },
  });
  return data;
}

export async function markOrderNoticesRead(
  orderId: number,
  body: MarkNoticesReadDto
): Promise<MarkNoticesReadResponseDto> {
  const { data } = await http.post<MarkNoticesReadResponseDto>(`/orders/${orderId}/notices/read`, body);
  return data;
}
