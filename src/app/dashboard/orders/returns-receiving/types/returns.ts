export type CategoryBucket = 'RESEND' | 'FINAL_RETURN' | 'WAREHOUSE';

export interface MockReturnOrder {
  id: number;
  code: string;
  customerName: string;
  customerPhone: string;
  governorate: string;
  totalCost: number;
  currentStatus: string;
}

export type ReturnScanResolution =
  | { ok: true; order: MockReturnOrder }
  | {
      ok: false;
      reason:
        | 'UNKNOWN'
        | 'DUPLICATE'
        | 'ALREADY_FINAL_RETURN'
        | 'ALREADY_CATEGORIZED';
    };

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
  receipt: File;
  codeSheets: File[];
}

export interface UploadReceiptProofResult {
  receiptUrl: string;
  sheetUrls: string[];
}
