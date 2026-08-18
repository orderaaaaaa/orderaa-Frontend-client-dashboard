import { OrderStatus } from '@/types/orders';
import { WORKFLOW_ORDER_STATUSES } from '../constants';

/**
 * T29 — the three ways one side (source or target) of a stock-workflow rule
 * can match a status.
 *
 * Declared LOCALLY: the backend wire DTO these mirror
 * (`fromSelection`/`toSelection`, T29 backend task 2) does not exist in
 * `lib/api/warehouses.ts` yet. The task that wires the rule builder into
 * `StockWorkflowsTab` re-exports/reconciles this against the real wire type
 * instead of this file inventing one — until then this is additive and
 * nothing consumes it.
 */
export type StatusSelectionType = 'ANY' | 'RANGE' | 'SPECIFIC';

export type RuleSide = 'from' | 'to';

/**
 * The per-side selection fields a rule carries twice — once for `from`, once
 * for `to`. Named to match the `RuleRow` fields the wiring task adds
 * (`fromType`/`toType`, `fromRangeStart`/`fromRangeEnd`,
 * `toRangeStart`/`toRangeEnd`) so that shape can satisfy this interface
 * directly rather than redefining it.
 */
export interface StatusRuleSides {
  fromType: StatusSelectionType;
  toType: StatusSelectionType;
  fromStatuses: OrderStatus[];
  toStatuses: OrderStatus[];
  fromRangeStart?: OrderStatus;
  fromRangeEnd?: OrderStatus;
  toRangeStart?: OrderStatus;
  toRangeEnd?: OrderStatus;
}

/**
 * Inclusive slice of `WORKFLOW_ORDER_STATUSES` between `start` and `end`.
 *
 * Guards on `indexOf >= 0` rather than trusting the input: the frontend
 * `OrderStatus` enum carries 4 legacy values (`PARTIAL_DELIVERY`,
 * `FINAL_RETURN`, `RETURN_RESEND_PENDING`, `RETURN_WAREHOUSE`) that the rules
 * API rejects, so they never appear in `WORKFLOW_ORDER_STATUSES` and resolve
 * to `-1` here.
 *
 * A reversed range (`start` after `end`) is not special-cased — the frontend
 * shows an inline error for it (see `StatusRangePicker`) rather than silently
 * auto-swapping, and `Array.prototype.slice` already returns `[]` for it,
 * matching the backend's `expandRange` (T29 backend task 2).
 */
export function expandRange(
  start: OrderStatus,
  end: OrderStatus
): OrderStatus[] {
  const startIndex = WORKFLOW_ORDER_STATUSES.indexOf(start);
  const endIndex = WORKFLOW_ORDER_STATUSES.indexOf(end);
  if (startIndex < 0 || endIndex < 0) return [];
  return WORKFLOW_ORDER_STATUSES.slice(startIndex, endIndex + 1);
}

/**
 * Whether `status` is matched by one side (`side`) of `rule`. ANY always
 * matches; RANGE checks the status's position falls between the endpoints
 * (inclusive); SPECIFIC checks membership in the chosen list.
 *
 * Mirrors the backend's `sideMatches` (T29 backend task 2) so the frontend
 * never re-derives a different notion of "covered" than the engine that
 * actually moves stock. Used by both the rule builder and
 * `StockRuleCoverageNotice` so the two cannot drift once wired up.
 */
export function sideCoversStatus(
  rule: StatusRuleSides,
  side: RuleSide,
  status: OrderStatus
): boolean {
  const type = side === 'from' ? rule.fromType : rule.toType;
  if (type === 'ANY') return true;

  if (type === 'RANGE') {
    const start = side === 'from' ? rule.fromRangeStart : rule.toRangeStart;
    const end = side === 'from' ? rule.fromRangeEnd : rule.toRangeEnd;
    if (!start || !end) return false;
    const statusIndex = WORKFLOW_ORDER_STATUSES.indexOf(status);
    const startIndex = WORKFLOW_ORDER_STATUSES.indexOf(start);
    const endIndex = WORKFLOW_ORDER_STATUSES.indexOf(end);
    if (statusIndex < 0 || startIndex < 0 || endIndex < 0) return false;
    return statusIndex >= startIndex && statusIndex <= endIndex;
  }

  const statuses = side === 'from' ? rule.fromStatuses : rule.toStatuses;
  return statuses.includes(status);
}

/**
 * Dedupe key for one side of a rule, type-prefixed so an ANY, a RANGE, and a
 * SPECIFIC side never collide just because they happen to cover the same
 * statuses today — `sideKey('SPECIFIC', ['NEW_ORDER'])` and
 * `sideKey('RANGE', [], 'NEW_ORDER', 'NEW_ORDER')` describe different rules
 * even though both currently mean "just NEW_ORDER" (semantic overlap between
 * them is the server's 409 to catch, not this key's).
 *
 * SPECIFIC sorts its statuses first so selection order never makes two
 * otherwise-identical rules look distinct.
 */
export function sideKey(
  type: StatusSelectionType,
  statuses: OrderStatus[],
  rangeStart?: OrderStatus,
  rangeEnd?: OrderStatus
): string {
  if (type === 'ANY') return 'ANY';
  if (type === 'RANGE') return `RANGE:${rangeStart ?? ''}..${rangeEnd ?? ''}`;
  return `SPECIFIC:${[...statuses].sort().join(',')}`;
}
