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
  createdAt: string;
  updatedAt: string;
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

export interface InvoiceProductApiItem {
  id: number;
  invoiceId: number;
  productId: number;
  variantId?: number | null;
  attributeOptionIds?: number[];
  variant?: InvoiceProductVariantDetail | null;
  quantity: number;
  price: number;
  packageCount?: number;
  piecesPerPackage?: number;
  createdAt: string;
  product: { id: number; name: string };
}

export interface SupplierInvoiceApiItem {
  id: number;
  code: string;
  type: 'PURCHASE' | 'PAID' | 'RETURN';
  supplierId: number;
  merchantId: number;
  createdByEmployeeId?: number;
  totalAmount: number;
  paymentAmount?: number;
  externalInvoiceNumber?: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  supplier: { id: number; name: string; nickname: string };
  createdByEmployee?: { id: number; accessLevel: string; department: string };
  products: InvoiceProductApiItem[];
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

export interface ApproveSupplierInvoiceDto {
  products: ApproveSupplierInvoiceProductDto[];
}

export async function getSuppliers(
  params?: GetSuppliersParams
): Promise<{ data: SupplierApiItem[]; meta: PaginationMeta }> {
  const response = await api.get('/suppliers', { params });
  return response.data as { data: SupplierApiItem[]; meta: PaginationMeta };
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

export async function approveSupplierInvoice(
  id: number,
  body: ApproveSupplierInvoiceDto,
): Promise<SupplierInvoiceApiItem> {
  const response = await api.post(`/supplier-invoices/${id}/approve`, body);
  return response.data as SupplierInvoiceApiItem;
}
