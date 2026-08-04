import type { Customer, OrderStatus } from '@/types/orders';

export type CategoryBucket = 'RESEND' | 'FINAL_RETURN' | 'WAREHOUSE';

export interface ReturnOrder {
  id: number;
  code: string;
  status: OrderStatus | string;
  bucket: CategoryBucket;
  totalCost: number;
  governorate?: string;
  city?: string;
  address?: string;
  customers: Pick<Customer, 'id' | 'name' | 'phone_numbers'> &
    Partial<Pick<Customer, 'governorate' | 'city' | 'address'>>;
  packagingWarning?: string | null;
  editRejectedNote?: string | null;
  isShadowed?: boolean;
  cancelReason?: string | null;
  pickupInvoice?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategorizeCommitPayload {
  sessionId: string;
  finalReturnCodes: string[];
  resendCodes: string[];
  warehouseCodes: string[];
}

export interface GeneratedResendCode {
  orderCode: string;
  newShipmentCode: string;
  invoiceUrl?: string;
}

export interface UploadReceiptProofPayload {
  sessionId?: string;
  receipt: File;
  codeSheets?: File[];
}

export interface UploadReceiptProofResult {
  sessionId: string;
  receiptUrl: string;
  codeSheetUrls?: string[];
}

export interface BulkUpdateResponse {
  updatedCount: number;
  message: string;
}

export interface ShippingCompanyCountResponse {
  count: number;
}

export interface SubmitReturnReceiptsPayload {
  orderCodes: string[];
  receiptImageUrl: string;
  codeSheetImageUrls?: string[];
}

export interface SubmitReturnReceiptsResponse {
  success: boolean;
  receiptId: number;
  receivedCount: number;
  receivedOrderCodes: string[];
}

export interface ReturnOrderCustomerDisplay {
  name: string;
  phone: string;
}

export function getCustomerDisplay(order: ReturnOrder): ReturnOrderCustomerDisplay {
  return {
    name: order.customers?.name ?? '',
    phone: order.customers?.phone_numbers?.[0] ?? '',
  };
}
