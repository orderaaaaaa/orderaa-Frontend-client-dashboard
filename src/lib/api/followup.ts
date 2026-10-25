import http from './http';
import type {
  FollowupOrder,
  FollowupFilters,
  FollowupClosureKind,
  ShippingPointType,
} from '@/types/logistics';

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
  if (filters.shippingCompanyId) params.shippingCompanyId = filters.shippingCompanyId;
  if (filters.governorate) params.governorate = filters.governorate;
  if (filters.city) params.city = filters.city;
  if (filters.code) params.code = filters.code;
  if (filters.createdAfter) params.createdAfter = filters.createdAfter;
  if (filters.createdBefore) params.createdBefore = filters.createdBefore;
  if (filters.customerName) params.customerName = filters.customerName;
  if (filters.customerPhone) params.customerPhone = filters.customerPhone;
  if (filters.productName) params.productName = filters.productName;
  if (filters.shippingStatuses?.length) params.shippingStatuses = filters.shippingStatuses;
  if (filters.workState) params.workState = filters.workState;
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

export interface FollowupReasonBody {
  reasonId?: number;
  reasonText?: string;
  notes?: string;
}

export interface FollowupClosureResponse {
  success: boolean;
  kind: FollowupClosureKind;
  closedAt: string;
}

export interface FollowupClosureUndoResponse {
  success: boolean;
  undoneKind: FollowupClosureKind;
}

export async function markFollowupClosed(orderId: number): Promise<FollowupClosureResponse> {
  const { data } = await http.post<FollowupClosureResponse>(`/orders/followup/${orderId}/close`);
  return data;
}

export async function markFollowupRefused(
  orderId: number,
  body: FollowupReasonBody
): Promise<FollowupClosureResponse> {
  const { data } = await http.post<FollowupClosureResponse>(`/orders/followup/${orderId}/refuse`, body);
  return data;
}

export async function markFollowupCancelled(
  orderId: number,
  body: FollowupReasonBody
): Promise<FollowupClosureResponse> {
  const { data } = await http.post<FollowupClosureResponse>(`/orders/followup/${orderId}/cancelled`, body);
  return data;
}

export async function undoFollowupClosure(orderId: number): Promise<FollowupClosureUndoResponse> {
  const { data } = await http.post<FollowupClosureUndoResponse>(`/orders/followup/${orderId}/closure/undo`);
  return data;
}

export async function markFollowupOverdue(orderId: number, lateNotes: string): Promise<FollowupSuccessResponse> {
  const { data } = await http.post<FollowupSuccessResponse>(`/orders/followup/${orderId}/overdue`, { lateNotes });
  return data;
}

export type FollowupNotePartyValue = 'CUSTOMER' | 'SHIPPING_COMPANY' | 'COURIER';

export interface FollowupNoteView {
  id: number;
  party: FollowupNotePartyValue;
  body: string;
  employeeId: number;
  employeeName: string | null;
  createdAt: string;
  editedAt: string | null;
  canEdit: boolean;
  canDelete: boolean;
}

export interface FollowupLegacyNote {
  id: number;
  name: string;
  note: string;
  employeeName: string | null;
  createdAt: string;
}

export interface FollowupCarrierText {
  at: string;
  text: string;
  repeats: number;
}

export interface FollowupCarrierContact {
  at: string;
  name: string | null;
  phone: string | null;
  repeats: number;
}

export interface FollowupNoteDay {
  day: string;
  isToday: boolean;
  canAddNotes: boolean;
  notes: FollowupNoteView[];
  legacyNotes: FollowupLegacyNote[];
  carrier: {
    texts: FollowupCarrierText[];
    contacts: FollowupCarrierContact[];
  };
}

export interface FollowupNotesPage {
  today: string;
  days: FollowupNoteDay[];
}

export interface CreateFollowupNoteBody {
  party: FollowupNotePartyValue;
  body: string;
}

export interface EditFollowupNoteBody {
  body: string;
}

export interface FollowupNoteDeleteResponse {
  success: boolean;
  id: number;
}

export type FollowupActionEventSource = 'ORDER_EVENT' | 'LATE_MARK' | 'CARRIER_SEND_AUDIT';

export interface FollowupActionEvent {
  id: number;
  source: FollowupActionEventSource;
  name: string;
  note: string | null;
  employeeName: string | null;
  createdAt: string;
}

export interface FollowupActionEventsPage {
  data: FollowupActionEvent[];
}

export async function getFollowupNotes(orderId: number): Promise<FollowupNotesPage> {
  const { data } = await http.get<FollowupNotesPage>(`/orders/followup/${orderId}/notes`);
  return data;
}

export async function addFollowupNote(orderId: number, body: CreateFollowupNoteBody): Promise<FollowupNoteView> {
  const { data } = await http.post<FollowupNoteView>(`/orders/followup/${orderId}/notes`, body);
  return data;
}

export async function editFollowupNote(
  orderId: number,
  noteId: number,
  body: EditFollowupNoteBody
): Promise<FollowupNoteView> {
  const { data } = await http.post<FollowupNoteView>(`/orders/followup/${orderId}/notes/${noteId}/edits`, body);
  return data;
}

export async function deleteFollowupNote(orderId: number, noteId: number): Promise<FollowupNoteDeleteResponse> {
  const { data } = await http.post<FollowupNoteDeleteResponse>(
    `/orders/followup/${orderId}/notes/${noteId}/deletions`
  );
  return data;
}

export async function getFollowupActionEvents(orderId: number): Promise<FollowupActionEventsPage> {
  const { data } = await http.get<FollowupActionEventsPage>(`/orders/followup/${orderId}/action-events`);
  return data;
}
