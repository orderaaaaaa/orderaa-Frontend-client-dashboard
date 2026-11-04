import api from './index';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SupplierApiItem {
  id: number;
  nickname: string;
  name: string;
  phoneNumber: string;
  email: string;
  governorate?: string;
  merchantId: number;
  totalPurchased: number;
  totalReturned: number;
  invoiceCount: number;
  paidAmount: number;
  remaining: number;
  held: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierBalancesSummaryApiItem {
  owedToSuppliers: number;
  owedBySuppliers: number;
  heldTotal: number;
  supplierCount: number;
  asOf: string;
}

export interface SupplierProductApiItem {
  productId: number;
  productName: string;
  totalQuantityPurchased: number;
  totalPurchaseAmount: number;
  totalQuantityReturned: number;
  totalReturnAmount: number;
  netAmount: number;
}

export interface ProductTransactionApiItem {
  invoiceId: number;
  invoiceCode: string;
  invoiceType: 'PURCHASE' | 'RETURN';
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
}

export interface InvoiceProductVariantOption {
  attributeOptionId?: number;
  attribute_option?: { id: number; name: string; attributeId: number };
  id?: number;
  name?: string;
}

export interface InvoiceProductVariantDetail {
  id: number;
  name?: string;
  options?: InvoiceProductVariantOption[];
}

export const INVOICE_LIFECYCLE = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;

export type InvoiceLifecycle = (typeof INVOICE_LIFECYCLE)[keyof typeof INVOICE_LIFECYCLE];

export interface InvoiceLineVariantCount {
  variantId: number;
  warehouseId: number | null;
  approvedCount: number;
  rejectedCount: number;
  variant: InvoiceProductVariantDetail | null;
}

export interface InvoiceProductApiItem {
  id: number;
  invoiceId: number;
  productId: number;
  variantId?: number | null;
  attributeOptionIds?: number[];
  variant?: InvoiceProductVariantDetail | null;
  variantCounts: InvoiceLineVariantCount[] | null;
  quantity: number;
  price: number;
  packageCount?: number;
  piecesPerPackage?: number;
  createdAt: string;
  product: { id: number; name: string };
}

export type InvoicePaymentStatus = 'NOT_PAID' | 'PARTIALLY_PAID' | 'PAID';

export interface SupplierEmployeeRef {
  id: number;
  accessLevel: string;
  department: string | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
}

export type SupplierInvoiceEntryMode = 'SINGULAR' | 'PACKAGE';

export interface SupplierInvoiceSettlement {
  id: number;
  code: string;
  paymentAmount: number;
  createdAt: string;
  isReversal: boolean;
}

export interface SupplierInvoiceApiItem {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  entryMode: SupplierInvoiceEntryMode | null;
  supplierId: number;
  merchantId: number;
  createdByEmployeeId: number;
  approvedByEmployeeId: number | null;
  totalAmount: number;
  paymentAmount: number | null;
  paymentStatus: InvoicePaymentStatus;
  externalInvoiceNumber: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
  supplier: { id: number; name: string; nickname: string | null };
  createdByEmployee: SupplierEmployeeRef | null;
  approvedByEmployee: SupplierEmployeeRef | null;
  products: InvoiceProductApiItem[];
  isApproved: boolean;
  approvedAt: string | null;
  lifecycle: InvoiceLifecycle;
  approvedWithCountChange: boolean;
  closedAt: string | null;
  closedByEmployeeId: number | null;
  closedByEmployee: SupplierEmployeeRef | null;
  settlesInvoiceId: number | null;
  reversesInvoiceId: number | null;
  reversedByInvoiceId: number | null;
  settledAmount?: number;
  outstandingAmount?: number;
  settlements?: SupplierInvoiceSettlement[];
}

export type SupplierInvoiceEventAction =
  | 'CREATED'
  | 'UPDATED'
  | 'ATTRIBUTED'
  | 'APPROVED'
  | 'CLOSED'
  | 'REVERSED'
  | 'DELETED';

export interface SupplierInvoiceEvent {
  id: number;
  action: SupplierInvoiceEventAction;
  createdAt: string;
  actor: { id: number; name: string | null } | null;
  changes: Record<string, unknown> | null;
}

export interface SupplierInvoiceHistoryPage {
  data: SupplierInvoiceEvent[];
  nextCursor: number | null;
}

export interface GetSuppliersParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  name?: string;
  remainingStatus?: 'creditor' | 'debtor' | 'zero';
  paidAmountMin?: number;
  paidAmountMax?: number;
  invoiceCountMin?: number;
  invoiceCountMax?: number;
}

export interface GetSupplierInvoicesParams {
  page?: number;
  limit?: number;
  type?: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  totalAmountMin?: number;
  totalAmountMax?: number;
  createdByEmployeeId?: number;
  approved?: boolean;
  receivable?: boolean;
  lifecycle?: InvoiceLifecycle;
  countChanged?: boolean;
  outstanding?: boolean;
}

export interface CreateSupplierDto {
  nickname: string;
  name: string;
  phoneNumber: string;
  email?: string;
  governorate?: string;
}

export interface UpdateSupplierDto {
  nickname?: string;
  name?: string;
  phoneNumber?: string;
  email?: string;
  governorate?: string;
}

export interface CreateInvoiceProductDto {
  productId: number;
  quantity: number;
  price: number;
  packageCount?: number;
  piecesPerPackage?: number;
  attributeOptionIds?: number[];
}

export interface CreateSupplierInvoiceDto {
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId: number;
  createdByEmployeeId?: number;
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  entryMode?: 'SINGULAR' | 'PACKAGE';
  products?: CreateInvoiceProductDto[];
  images?: string[];
  settlesInvoiceId?: number;
}

export interface UpdateSupplierInvoiceDto {
  createdByEmployeeId?: number;
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  products?: CreateInvoiceProductDto[];
  images?: string[];
}

export interface ApproveSupplierInvoiceVariantDto {
  attributeOptionIds?: number[];
  approvedCount: number;
  rejectedCount: number;
}

export interface ApproveSupplierInvoiceProductDto {
  invoiceProductId: number;
  variants: ApproveSupplierInvoiceVariantDto[];
}

export interface OpenInvoiceProductDto {
  invoiceProductId?: number;
  productId: number;
  price: number;
  variants: ApproveSupplierInvoiceVariantDto[];
}

export interface OpenInvoiceEditDto {
  products?: OpenInvoiceProductDto[];
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  images?: string[];
  createdByEmployeeId?: number;
}

export interface ReturnStockLineRequest {
  key: string;
  productId: number;
  variantId?: number;
  attributeOptionIds?: number[];
}

export interface ReturnStockRequestBody {
  lines: ReturnStockLineRequest[];
}

export interface ReturnStockLine {
  key: string;
  productId: number;
  variantId: number | null;
  warehouseId: number | null;
  warehouseName: string | null;
  available: number;
}

export interface ReturnStockResponse {
  lines: ReturnStockLine[];
}

export interface ApproveSupplierInvoiceDto {
  products: ApproveSupplierInvoiceProductDto[];
  /** destination warehouse for the approved stock */
  warehouseId?: number;
  /**
   * Confirms that the invoiced quantity and the invoice's total amount may be
   * rewritten to match the counted totals. Without it the server rejects a
   * mismatch with 409 `INVOICE_QUANTITY_MISMATCH`. Per-request only.
   */
  acknowledgeQuantityChange?: boolean;
}

export async function getSuppliers(
  params?: GetSuppliersParams
): Promise<{ data: SupplierApiItem[]; meta: PaginationMeta }> {
  const response = await api.get('/suppliers', { params });
  return response.data as { data: SupplierApiItem[]; meta: PaginationMeta };
}

export async function getSuppliersSummary(): Promise<SupplierBalancesSummaryApiItem> {
  const response = await api.get('/suppliers/summary');
  return response.data as SupplierBalancesSummaryApiItem;
}

export async function getSupplierById(id: number): Promise<SupplierApiItem> {
  const response = await api.get(`/suppliers/${id}`);
  return response.data as SupplierApiItem;
}

export async function createSupplier(body: CreateSupplierDto): Promise<SupplierApiItem> {
  const response = await api.post('/suppliers', body);
  return response.data as SupplierApiItem;
}

export async function updateSupplier(id: number, body: UpdateSupplierDto): Promise<SupplierApiItem> {
  const response = await api.patch(`/suppliers/${id}`, body);
  return response.data as SupplierApiItem;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

export async function getSupplierProducts(id: number): Promise<SupplierProductApiItem[]> {
  const response = await api.get(`/suppliers/${id}/products`);
  return response.data as SupplierProductApiItem[];
}

export async function getProductTransactions(
  supplierId: number,
  productId: number
): Promise<ProductTransactionApiItem[]> {
  const response = await api.get(`/suppliers/${supplierId}/products/${productId}/transactions`);
  return response.data as ProductTransactionApiItem[];
}

export async function getSupplierInvoices(
  params?: GetSupplierInvoicesParams
): Promise<{ data: SupplierInvoiceApiItem[]; meta: PaginationMeta }> {
  const response = await api.get('/supplier-invoices', { params });
  return response.data as { data: SupplierInvoiceApiItem[]; meta: PaginationMeta };
}

export async function getSupplierInvoiceById(id: number): Promise<SupplierInvoiceApiItem> {
  const response = await api.get(`/supplier-invoices/${id}`);
  return response.data as SupplierInvoiceApiItem;
}

export async function createSupplierInvoice(body: CreateSupplierInvoiceDto): Promise<SupplierInvoiceApiItem> {
  const response = await api.post('/supplier-invoices', body);
  return response.data as SupplierInvoiceApiItem;
}

export async function updateSupplierInvoice(
  id: number,
  body: UpdateSupplierInvoiceDto
): Promise<SupplierInvoiceApiItem> {
  const response = await api.patch(`/supplier-invoices/${id}`, body);
  return response.data as SupplierInvoiceApiItem;
}

export async function deleteSupplierInvoice(id: number): Promise<void> {
  await api.delete(`/supplier-invoices/${id}`);
}

export async function getSupplierInvoiceHistory(
  id: number,
  params?: { cursor?: number; limit?: number },
): Promise<SupplierInvoiceHistoryPage> {
  const response = await api.get(`/supplier-invoices/${id}/history`, { params });
  return response.data as SupplierInvoiceHistoryPage;
}

export async function approveSupplierInvoice(
  id: number,
  body: ApproveSupplierInvoiceDto,
): Promise<SupplierInvoiceApiItem> {
  const response = await api.post(`/supplier-invoices/${id}/approve`, body);
  return response.data as SupplierInvoiceApiItem;
}

export async function getReturnStock(body: ReturnStockRequestBody): Promise<ReturnStockResponse> {
  const response = await api.post('/supplier-invoices/return-stock', body);
  return response.data as ReturnStockResponse;
}

export async function closeSupplierInvoice(id: number): Promise<SupplierInvoiceApiItem> {
  const response = await api.post(`/supplier-invoices/${id}/close`);
  return response.data as SupplierInvoiceApiItem;
}

export async function reverseSupplierInvoice(id: number): Promise<SupplierInvoiceApiItem> {
  const response = await api.post(`/supplier-invoices/${id}/reverse`, {});
  return response.data as SupplierInvoiceApiItem;
}

export async function editOpenSupplierInvoice(id: number, body: OpenInvoiceEditDto): Promise<SupplierInvoiceApiItem> {
  const response = await api.patch(`/supplier-invoices/${id}/open-lines`, body);
  return response.data as SupplierInvoiceApiItem;
}
