import { OrderStatus } from '@/types/orders';
import type {
  BulkUpdateResponse,
  CategorizeCommitPayload,
  GeneratedResendCode,
  ReturnOrder,
  ShippingCompanyCountResponse,
  UploadReceiptProofPayload,
  UploadReceiptProofResult,
} from '../types';
import { MOCK_RETURN_ORDERS } from './fixtures';

const statusByCode = new Map<string, string>(
  MOCK_RETURN_ORDERS.map((o) => [o.code.toUpperCase(), o.status]),
);

const byCode = new Map<string, ReturnOrder>(
  MOCK_RETURN_ORDERS.map((o) => [o.code.toUpperCase(), o]),
);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.floor(Math.random() * 500));
}

function mockAxiosError(status: number, message: string): Error {
  const err = new Error(`Request failed with status code ${status}`) as Error & {
    isAxiosError: boolean;
    response: {
      status: number;
      data: { message: string; statusCode: number };
    };
  };
  err.isAxiosError = true;
  err.response = {
    status,
    data: { message, statusCode: status },
  };
  return err;
}

function nowIso(): string {
  return new Date().toISOString();
}

export async function getReturnOrderByCode(code: string): Promise<ReturnOrder> {
  await randomDelay();
  const key = code.trim().toUpperCase();
  const order = byCode.get(key);
  if (!order) {
    throw mockAxiosError(404, `لا يوجد طلب بالكود ${code}`);
  }
  const currentStatus = statusByCode.get(key) ?? order.status;
  return { ...order, status: currentStatus };
}

export async function getShippingCompanyExpectedCount(): Promise<ShippingCompanyCountResponse> {
  await randomDelay();
  const count = MOCK_RETURN_ORDERS.filter(
    (o) => (statusByCode.get(o.code.toUpperCase()) ?? o.status) !== OrderStatus.FINAL_RETURN,
  ).length;
  return { count };
}

export async function uploadReturnsReceiptProof(
  payload: UploadReceiptProofPayload,
): Promise<UploadReceiptProofResult> {
  await delay(600);
  const sessionId = payload.sessionId ?? `session-${Date.now()}`;
  return {
    sessionId,
    receiptUrl: `mock://receipts/${payload.receipt.name}`,
  };
}

export async function bulkUpdateReturnCategories(
  payload: CategorizeCommitPayload,
): Promise<BulkUpdateResponse> {
  await randomDelay();
  const timestamp = nowIso();
  let updated = 0;

  const applyStatus = (codes: string[], status: OrderStatus) => {
    codes.forEach((code) => {
      const key = code.trim().toUpperCase();
      const order = byCode.get(key);
      if (order) {
        statusByCode.set(key, status);
        byCode.set(key, { ...order, status, updatedAt: timestamp });
        updated += 1;
      }
    });
  };

  applyStatus(payload.finalReturnCodes, OrderStatus.FINAL_RETURN);
  applyStatus(payload.resendCodes, OrderStatus.RETURN_RESEND_PENDING);
  applyStatus(payload.warehouseCodes, OrderStatus.RETURN_WAREHOUSE);

  return {
    updatedCount: updated,
    message: 'تم تقسيم المرتجعات بنجاح',
  };
}

export async function generateReturnResendCodes(
  orderCodes: string[],
): Promise<GeneratedResendCode[]> {
  await randomDelay();
  return orderCodes.map((code) => ({
    orderCode: code,
    newShipmentCode: `RSND-${Math.floor(100000 + Math.random() * 900000)}`,
  }));
}

export function __resetReturnsMocks(): void {
  statusByCode.clear();
  MOCK_RETURN_ORDERS.forEach((o) =>
    statusByCode.set(o.code.toUpperCase(), o.status),
  );
}
