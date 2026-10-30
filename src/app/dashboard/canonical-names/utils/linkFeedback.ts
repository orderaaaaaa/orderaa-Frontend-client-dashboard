import { getApiErrorMessage } from '@/utils/apiError';
import {
  CANONICAL_NAME_ERROR_CODES,
  type CanonicalName,
  type LinkResult,
} from '@/types/canonicalNames';
import { readStoredLocale } from '@/i18n/locale';
import { translate } from '@/i18n/translate';
import {
  canonicalNameErrorMessage,
  getCanonicalNameError,
  type CanonicalErrorContext,
} from './canonicalNameErrors';

export function isRowNotFoundError(err: unknown) {
  return (
    getCanonicalNameError(err)?.code === CANONICAL_NAME_ERROR_CODES.ROW_NOT_FOUND
  );
}

export function locationLinkErrorMessage(err: unknown, context: CanonicalErrorContext = {}) {
  return (
    canonicalNameErrorMessage(err, context) ??
    getApiErrorMessage(err, translate(readStoredLocale(), 'canonical.errors.generic'))
  );
}

export function skippedAliasesMessage(
  results: LinkResult[],
  names: CanonicalName[],
) {
  const seen = new Set<string>();
  const lines: string[] = [];
  results.forEach((result) => {
    (result.aliasesSkipped ?? []).forEach((alias) => {
      if (seen.has(alias.spelling)) return;
      seen.add(alias.spelling);
      const other =
        alias.resolvesToCanonicalNameId !== null
          ? names.find((name) => name.id === alias.resolvesToCanonicalNameId)
          : undefined;
      lines.push(
        other
          ? `النص «${alias.spelling}» مرتبط بالفعل باسم آخر «${other.name}» ولن يتغير`
          : `النص «${alias.spelling}» مرتبط بالفعل باسم آخر ولن يتغير`,
      );
    });
  });
  return lines.length > 0 ? lines.join('\n') : null;
}
