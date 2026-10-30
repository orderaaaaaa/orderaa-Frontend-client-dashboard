import { getApiErrorMessage } from '@/utils/apiError';
import {
  describeMergeIssue,
  mergePlanErrorBody,
} from '../../utils/mergePlan';
import type { UnlinkedLinkMoveConflictBody, UnlinkedLinkMove } from '../types/linkIssues';

const STORE_LINK_MOVE_CONFIRMATION_REQUIRED = 'STORE_LINK_MOVE_CONFIRMATION_REQUIRED';

const responseDataOf = (error: unknown): unknown =>
  (error as { response?: { data?: unknown } } | null)?.response?.data;

export function unlinkedMoveConflictOf(
  error: unknown,
): UnlinkedLinkMoveConflictBody | null {
  const data = responseDataOf(error);
  if (typeof data !== 'object' || data === null) return null;
  if (!('code' in data) || data.code !== STORE_LINK_MOVE_CONFIRMATION_REQUIRED) return null;
  if (!('moves' in data) || !Array.isArray(data.moves)) return null;
  return {
    statusCode: 409,
    code: STORE_LINK_MOVE_CONFIRMATION_REQUIRED,
    message: 'message' in data && typeof data.message === 'string' ? data.message : '',
    moves: data.moves as UnlinkedLinkMove[],
  };
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
