import { getApiErrorMessage, getApiErrorStatus } from '@/utils/apiError';

export function printApiErrorMessage(error: unknown, fallback: string): string {
  const status = getApiErrorStatus(error);
  if (status === undefined || status >= 500) return fallback;
  return getApiErrorMessage(error, fallback);
}
