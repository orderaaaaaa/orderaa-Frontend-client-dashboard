import { getApiErrorMessage } from '@/utils/apiError';
import {
  describeMergeIssue,
  mergePlanErrorBody,
} from '../../utils/mergePlan';

const STORE_LINK_MOVE_CONFIRMATION_REQUIRED = 'STORE_LINK_MOVE_CONFIRMATION_REQUIRED';

const responseDataOf = (error: unknown): unknown =>
  (error as { response?: { data?: unknown } } | null)?.response?.data;

export function isUnlinkedMoveConflict(error: unknown): boolean {
  const data = responseDataOf(error);
  return (
    typeof data === 'object' &&
    data !== null &&
    'code' in data &&
    data.code === STORE_LINK_MOVE_CONFIRMATION_REQUIRED
  );
}

export function linkIssueErrorMessage(
  error: unknown,
  fallback: string,
  labelOf: (variantId: number) => string = () => '',
): string {
  const planError = mergePlanErrorBody(error);
  if (planError && planError.details.issues.length > 0) {
    return planError.details.issues
      .map((issue) => describeMergeIssue(issue, labelOf))
      .join('\n');
  }
  return getApiErrorMessage(error, fallback);
}
