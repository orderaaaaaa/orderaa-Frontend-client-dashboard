import { getApiErrorMessage } from '@/utils/apiError';
import {
  CANONICAL_NAME_ERROR_CODES,
  type CanonicalName,
  type LinkResult,
} from '@/types/canonicalNames';
import { getCanonicalNameError } from './canonicalNameErrors';
import { locationSourceLabel } from './locationSourceLabel';

export function isRowNotFoundError(err: unknown) {
  return (
    getCanonicalNameError(err)?.code === CANONICAL_NAME_ERROR_CODES.ROW_NOT_FOUND
  );
}

export function locationLinkErrorMessage(err: unknown) {
  const fallback = getApiErrorMessage(err, 'تعذر تنفيذ الربط');
  const error = getCanonicalNameError(err);
  if (!error) return fallback;

  switch (error.code) {
    case CANONICAL_NAME_ERROR_CODES.ROW_IDS_REQUIRED:
      return 'اختر صفا واحدا على الأقل للربط';
    case CANONICAL_NAME_ERROR_CODES.ROW_NOT_FOUND:
      return 'بعض الصفوف لم تعد موجودة، تم تحديث القائمة';
    case CANONICAL_NAME_ERROR_CODES.DUPLICATE_SOURCE_IN_REQUEST:
      return error.details
        ? `اختر صفا واحدا فقط من ${locationSourceLabel(error.details.source)}`
        : fallback;
    case CANONICAL_NAME_ERROR_CODES.SOURCE_ALREADY_LINKED:
      return error.details
        ? `هذا الاسم مربوط بالفعل بصف من ${locationSourceLabel(error.details.source)}، ألغ ربطه أولا`
        : 'هذا الاسم مربوط بالفعل بصف من نفس شركة الشحن، ألغ ربطه أولا';
    case CANONICAL_NAME_ERROR_CODES.CHILD_ROWS_LINKED:
      return [
        'ألغ ربط المدن التابعة أولا',
        ...(error.details?.rows ?? []).map(
          (row) => `${locationSourceLabel(row.source)}: ${row.label}`,
        ),
      ].join('\n');
    case CANONICAL_NAME_ERROR_CODES.UNSCOPED_GROUP:
      return 'اربط المحافظة أولا';
    default:
      return fallback;
  }
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
