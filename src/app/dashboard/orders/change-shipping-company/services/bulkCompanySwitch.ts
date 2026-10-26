import http from '@/lib/api/http';
import type {
  BulkCompanySwitchRequest,
  BulkCompanySwitchResponse,
} from '../types/bulkCompanySwitch';

type HttpResponseLike = { status?: unknown; data?: unknown };

function responseOf(error: unknown): HttpResponseLike | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  const response = (error as { response?: unknown }).response;
  return typeof response === 'object' && response !== null
    ? (response as HttpResponseLike)
    : undefined;
}

export async function switchOrderCompany(
  orderId: number,
  body: BulkCompanySwitchRequest
): Promise<BulkCompanySwitchResponse> {
  const response = await http.post<BulkCompanySwitchResponse>(
    `/orders/${orderId}/bulk-company-switch`,
    body
  );
  return response.data;
}

export function httpStatusOf(error: unknown): number | undefined {
  const status = responseOf(error)?.status;
  return typeof status === 'number' ? status : undefined;
}

export function serverMessageOf(error: unknown): string | null {
  const data = responseOf(error)?.data;
  if (typeof data !== 'object' || data === null) return null;
  const message = (data as { message?: unknown }).message;
  if (typeof message === 'string') return message;
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join('\n');
  }
  return null;
}
