import type {
  CategorizeCommitPayload,
  GeneratedResendCode,
  MockReturnOrder,
  ReturnScanResolution,
  UploadReceiptProofPayload,
  UploadReceiptProofResult,
} from '../types';
import { MOCK_RETURN_ORDERS } from './fixtures';

const statusByCode = new Map<string, string>(
  MOCK_RETURN_ORDERS.map((o) => [o.code.toUpperCase(), o.currentStatus]),
);

const byCode = new Map<string, MockReturnOrder>(
  MOCK_RETURN_ORDERS.map((o) => [o.code.toUpperCase(), o]),
);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.floor(Math.random() * 500));
}

export async function mockResolveScan(
  code: string,
): Promise<ReturnScanResolution> {
  await randomDelay();
  const key = code.trim().toUpperCase();
  const order = byCode.get(key);

  if (!order) {
    return { ok: false, reason: 'UNKNOWN' };
  }

  const currentStatus = statusByCode.get(key) ?? order.currentStatus;
  if (currentStatus === 'FINAL_RETURN') {
    return { ok: false, reason: 'ALREADY_FINAL_RETURN' };
  }

  return { ok: true, order: { ...order, currentStatus } };
}

export async function mockGetShippingCompanyCount(): Promise<number> {
  await randomDelay();
  return MOCK_RETURN_ORDERS.filter((o) => o.currentStatus !== 'FINAL_RETURN').length;
}

export async function mockCommitFinalReturns(
  codes: string[],
): Promise<{ updated: number }> {
  await randomDelay();
  codes.forEach((code) => {
    const key = code.trim().toUpperCase();
    if (byCode.has(key)) {
      statusByCode.set(key, 'FINAL_RETURN');
    }
  });
  return { updated: codes.length };
}

export async function mockUploadReceiptProof(
  payload: UploadReceiptProofPayload,
): Promise<UploadReceiptProofResult> {
  await delay(600);
  return {
    receiptUrl: `mock://receipts/${payload.receipt.name}`,
    sheetUrls: payload.codeSheets.map((f) => `mock://sheets/${f.name}`),
  };
}

export async function mockUpdateReturnCategories(
  payload: CategorizeCommitPayload,
): Promise<{ updated: number }> {
  await randomDelay();
  payload.finalReturnCodes.forEach((c) =>
    statusByCode.set(c.toUpperCase(), 'FINAL_RETURN'),
  );
  payload.resendCodes.forEach((c) =>
    statusByCode.set(c.toUpperCase(), 'RETURN_RESEND_PENDING'),
  );
  payload.warehouseCodes.forEach((c) =>
    statusByCode.set(c.toUpperCase(), 'RETURN_WAREHOUSE'),
  );
  return {
    updated:
      payload.finalReturnCodes.length +
      payload.resendCodes.length +
      payload.warehouseCodes.length,
  };
}

export async function mockGenerateResendCodes(
  orderCodes: string[],
): Promise<GeneratedResendCode[]> {
  await randomDelay();
  return orderCodes.map((code) => ({
    orderCode: code,
    newShipmentCode: `RSND-${Math.floor(100000 + Math.random() * 900000)}`,
  }));
}

export function __resetMocks(): void {
  statusByCode.clear();
  MOCK_RETURN_ORDERS.forEach((o) =>
    statusByCode.set(o.code.toUpperCase(), o.currentStatus),
  );
}
