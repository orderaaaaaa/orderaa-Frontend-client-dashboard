import {
  CANONICAL_NAME_ERROR_CODES,
  type CanonicalNameError,
  type CanonicalNameErrorCode,
} from '@/types/canonicalNames';

const KNOWN_CODES = new Set<string>(Object.values(CANONICAL_NAME_ERROR_CODES));

const isCanonicalNameErrorCode = (
  code: unknown,
): code is CanonicalNameErrorCode =>
  typeof code === 'string' && KNOWN_CODES.has(code);

export function getCanonicalNameError(err: unknown): CanonicalNameError | null {
  const data = (
    err as {
      response?: {
        data?: { code?: unknown; message?: unknown; details?: unknown };
      };
    }
  )?.response?.data;

  if (!data || !isCanonicalNameErrorCode(data.code)) return null;

  const message = Array.isArray(data.message)
    ? data.message.join('\n')
    : typeof data.message === 'string'
      ? data.message
      : '';

  return {
    code: data.code,
    message,
    details:
      data.details !== null && typeof data.details === 'object'
        ? data.details
        : undefined,
  } as CanonicalNameError;
}
