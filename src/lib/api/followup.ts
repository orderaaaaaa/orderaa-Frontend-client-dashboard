import http from './http';
import type { FollowupOrder, FollowupFilters, ShippingPointType } from '@/types/logistics';

export interface FollowupPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FollowupOrdersResponse {
  data: FollowupOrder[];
  meta: FollowupPaginationMeta;
}

function buildParams(filters: FollowupFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (filters.page != null) params.page = String(filters.page);
  if (filters.limit != null) params.limit = String(filters.limit);
  if (filters.search) params.search = filters.search;
  if (filters.orderByDirection) params.orderByDirection = filters.orderByDirection;
  if (filters.newFirst != null) params.newFirst = filters.newFirst;
  if (filters.shippingCompany) params.shippingCompany = filters.shippingCompany;
  if (filters.governorate) params.governorate = filters.governorate;
  if (filters.city) params.city = filters.city;
  if (filters.code) params.code = filters.code;
  if (filters.createdAfter) params.createdAfter = filters.createdAfter;
  if (filters.createdBefore) params.createdBefore = filters.createdBefore;
  if (filters.customerName) params.customerName = filters.customerName;
  if (filters.customerPhone) params.customerPhone = filters.customerPhone;
  if (filters.productName) params.productName = filters.productName;
  if (filters.shippingStatuses?.length) params.shippingStatuses = filters.shippingStatuses;
  return params;
}

export async function getFollowupNewOrders(filters: FollowupFilters = {}): Promise<FollowupOrdersResponse> {
  const { data } = await http.get<FollowupOrdersResponse>('/orders/followup/new-orders', {
    params: buildParams(filters),
  });
  return data;
}

export async function getFollowupOverdue(filters: FollowupFilters = {}): Promise<FollowupOrdersResponse> {
  const { data } = await http.get<FollowupOrdersResponse>('/orders/followup/overdue', {
    params: buildParams(filters),
  });
  return data;
}

export async function getFollowupExecuted(filters: FollowupFilters = {}): Promise<FollowupOrdersResponse> {
  const { data } = await http.get<FollowupOrdersResponse>('/orders/followup/executed', {
    params: buildParams(filters),
  });
  return data;
}

export interface FollowupEventPointResponse {
  id: number;
  settingId: number;
  eventName: string;
  pointType: ShippingPointType;
  createdAt: string;
}

export async function recordFollowupEventPoint(
  orderId: number,
  eventId: number,
  pointType: ShippingPointType
): Promise<FollowupEventPointResponse> {
  const { data } = await http.post<FollowupEventPointResponse>(
    `/orders/followup/${orderId}/events/${eventId}/point`,
    { pointType }
  );
  return data;
}

export interface FollowupSuccessResponse {
  success: boolean;
}

export async function markFollowupAttempted(orderId: number, note?: string): Promise<FollowupSuccessResponse> {
  const body = note ? { note } : {};
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/attempted`, body);
  return data;
}

export async function markFollowupPostponed(orderId: number, date: string): Promise<FollowupSuccessResponse> {
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/postponed`, { date });
  return data;
}

export interface FollowupChangeProductInput {
  productId: number;
  quantity: number;
  attributeOptionIds: number[];
}

export interface FollowupChangeProductsResponse {
  success: boolean;
  originalOrderCode: string;
  newOrderId: number;
  newOrderCode: string;
}

export async function markFollowupChangeProducts(
  orderId: number,
  products: FollowupChangeProductInput[]
): Promise<FollowupChangeProductsResponse> {
  const { data } = await http.post<FollowupChangeProductsResponse>(
    `/orders/followup/${orderId}/change-products`,
    { products }
  );
  return data;
}

export async function markFollowupSendAgain(orderId: number, reason: string): Promise<FollowupSuccessResponse> {
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/send-again`, { reason });
  return data;
}

export async function markFollowupCancelled(
  orderId: number,
  reason: string,
  cancellationNotes?: string
): Promise<FollowupSuccessResponse> {
  const body: { reason: string; cancellationNotes?: string } = { reason };
  if (cancellationNotes) body.cancellationNotes = cancellationNotes;
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/cancelled`, body);
  return data;
}

export async function markFollowupOverdue(orderId: number, lateNotes: string): Promise<FollowupSuccessResponse> {
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/overdue`, { lateNotes });
  return data;
}
