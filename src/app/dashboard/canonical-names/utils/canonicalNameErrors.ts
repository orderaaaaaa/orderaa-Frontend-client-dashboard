import { readStoredLocale } from '@/i18n/locale';
import { pluralAr } from '@/i18n/pluralAr';
import { translate, type TranslationKey, type TranslationParams } from '@/i18n/translate';
import {
  CANONICAL_NAME_ERROR_CODES,
  type CanonicalNameError,
  type CanonicalNameErrorCode,
} from '@/types/canonicalNames';
import { locationSourceLabel } from './locationSourceLabel';

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

export interface CanonicalErrorContext {
  name?: string;
}

const translateNow = (key: TranslationKey, params?: TranslationParams) =>
  translate(readStoredLocale(), key, params);

const genericMessage = () => translateNow('canonical.errors.generic');

const withName = (
  key: TranslationKey,
  context: CanonicalErrorContext,
  params: TranslationParams = {},
): string => (context.name === undefined ? genericMessage() : translateNow(key, { ...params, name: context.name }));

export function canonicalNameErrorMessage(
  err: unknown,
  context: CanonicalErrorContext = {},
): string | null {
  const error = getCanonicalNameError(err);
  if (!error) return null;

  switch (error.code) {
    case CANONICAL_NAME_ERROR_CODES.ROW_NOT_FOUND:
      return translateNow('canonical.errors.rowNotFound');
    case CANONICAL_NAME_ERROR_CODES.SOURCE_ALREADY_LINKED:
      if (!error.details) return null;
      return withName('canonical.errors.sourceAlreadyLinked', context, {
        carrier: locationSourceLabel(error.details.source),
      });
    case CANONICAL_NAME_ERROR_CODES.CHILD_ROWS_LINKED:
      if (!error.details) return null;
      return withName('canonical.errors.childRowsLinked', context, {
        cities: error.details.rows.map((row) => row.label).join(translateNow('canonical.list.separator')),
      });
    case CANONICAL_NAME_ERROR_CODES.UNSCOPED_GROUP:
      return translateNow('canonical.errors.unscopedGroup');
    case CANONICAL_NAME_ERROR_CODES.CANONICAL_SCOPE_MISMATCH:
      return translateNow('canonical.errors.scopeMismatch');
    case CANONICAL_NAME_ERROR_CODES.SPELLING_IS_CANONICAL_NAME:
      return translateNow('canonical.errors.spellingIsCanonical');
    case CANONICAL_NAME_ERROR_CODES.CANONICAL_NAME_EXISTS:
      return translateNow('canonical.errors.nameExists');
    case CANONICAL_NAME_ERROR_CODES.CANONICAL_NAME_NOT_FOUND:
      return translateNow('canonical.errors.nameNotFound');
    case CANONICAL_NAME_ERROR_CODES.LINK_TARGET_INVALID:
      return translateNow('canonical.errors.linkTargetInvalid');
    case CANONICAL_NAME_ERROR_CODES.NAME_HAS_LINKED_ROWS: {
      if (!error.details) return null;
      const rows = error.details.rowIds.length;
      return withName('canonical.errors.nameHasLinkedRows', context, {
        rows,
        locationNoun: pluralAr(translateNow, 'location', rows),
      });
    }
    case CANONICAL_NAME_ERROR_CODES.DUPLICATE_SOURCE_IN_REQUEST:
      return translateNow('canonical.errors.duplicateSource');
    case CANONICAL_NAME_ERROR_CODES.SYSTEM_CANONICAL:
      return translateNow('canonical.errors.systemName');
    case CANONICAL_NAME_ERROR_CODES.DOMAIN_NOT_APPLICABLE:
    case CANONICAL_NAME_ERROR_CODES.SCOPE_NOT_APPLICABLE:
    case CANONICAL_NAME_ERROR_CODES.PARENT_REQUIRED:
    case CANONICAL_NAME_ERROR_CODES.PARENT_NOT_ALLOWED:
    case CANONICAL_NAME_ERROR_CODES.PARENT_DOMAIN_MISMATCH:
      return genericMessage();
    default:
      return null;
  }
}
