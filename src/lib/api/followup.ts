import http from './http';
import type { FollowupClosureKind } from '@/types/logistics';
import type { CarrierSendBlock } from '@/types/manual-order';
import type { OrderStatus } from '@/types/orders';

export interface FollowupChangeProductVariant {
  name: string;
  optionName: string;
}

export interface FollowupCustomVariant {
  label: string;
  value: string;
}

export interface FollowupChangeProductInput {
  productId: number;
  quantity: number;
  variants: FollowupChangeProductVariant[];
  customVariants?: FollowupCustomVariant[];
}

export interface FollowupChangeProductsBody {
  products: FollowupChangeProductInput[];
  totalCost?: number;
}

export interface FollowupChangeProductsResponse {
  success: true;
  originalOrderCode: string;
  newOrderId: number;
  newOrderCode: string;
  isShadowed: boolean;
  isParked: boolean;
  carrierSend: CarrierSendBlock | null;
}

export async function markFollowupChangeProducts(
  orderId: number,
  body: FollowupChangeProductsBody
): Promise<FollowupChangeProductsResponse> {
  const { data } = await http.post<FollowupChangeProductsResponse>(
    `/orders/followup/${orderId}/change-products`,
    body
  );
  return data;
}

export interface FollowupExchangeCandidateItem {
  productId: number;
  variantId: number;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
}

export interface FollowupExchangeCandidate {
  id: number;
  code: string;
  status: OrderStatus;
  totalCost: number;
  shippingCost: number | null;
  createdAt: string;
  items: FollowupExchangeCandidateItem[];
  openExchangeCode: string | null;
}

export type FollowupExchangeReason = 'SIZE_OR_COLOR' | 'DIFFERENT_PRODUCT' | 'DEFECT_OR_WRONG_ITEM';

export type FollowupExchangeShippingPayer = 'CUSTOMER' | 'MERCHANT';

export interface FollowupExchangeReturnItemInput {
  productId: number;
  variantId?: number;
  quantity: number;
}

export interface FollowupExchangeBody {
  sourceOrderId: number;
  reason: FollowupExchangeReason;
  returnItems: FollowupExchangeReturnItemInput[];
  products: FollowupChangeProductInput[];
  shippingPaidBy?: FollowupExchangeShippingPayer;
  totalCost?: number;
  returnShipmentContent: string;
  notes?: string;
}

export interface FollowupExchangeResponse {
  success: true;
  originalOrderCode: string;
  newOrderId: number;
  newOrderCode: string;
  isShadowed: boolean;
  isParked: boolean;
  refundDue: number;
  codAmount: number;
  carrierSend: CarrierSendBlock | null;
}

export async function createFollowupExchange(
  orderId: number,
  body: FollowupExchangeBody
): Promise<FollowupExchangeResponse> {
  const { data } = await http.post<FollowupExchangeResponse>(`/orders/followup/${orderId}/exchange`, body);
  return data;
}

export interface FollowupExchangeCandidatesResponse {
  data: FollowupExchangeCandidate[];
}

export async function getExchangeCandidates(orderId: number): Promise<FollowupExchangeCandidatesResponse> {
  const { data } = await http.get<FollowupExchangeCandidatesResponse>(
    `/orders/followup/${orderId}/exchange-candidates`
  );
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

export type BulkCloseResultItem =
  | { orderId: number; ok: true }
  | { orderId: number; ok: false; code: string; message: string };

export interface BulkCloseResponse {
  results: BulkCloseResultItem[];
  succeeded: number;
  failed: number;
}

export async function markFollowupClosedBulk(orderIds: number[]): Promise<BulkCloseResponse> {
  const { data } = await http.post<BulkCloseResponse>('/orders/followup/close-bulk', { orderIds });
  return data;
}

export async function undoFollowupClosure(orderId: number): Promise<FollowupClosureUndoResponse> {
  const { data } = await http.post<FollowupClosureUndoResponse>(`/orders/followup/${orderId}/closure/undo`);
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
