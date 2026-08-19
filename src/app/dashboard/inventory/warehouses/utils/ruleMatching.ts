import { OrderStatus } from '@/types/orders';
import type { StatusSelectionType } from '@/lib/api/warehouses';
import { WORKFLOW_ORDER_STATUSES } from '../constants';

/**
 * T29 — the three ways one side (source or target) of a stock-workflow rule
 * can match a status.
 *
 * Re-exported from the wire types rather than declared here: the rule builder
 * and this matcher must speak the SAME union the API stores, or a selection
 * could round-trip into a type the matcher does not know.
 */
export type { StatusSelectionType };

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
 * The same triple in WIRE spelling — `fromSelection`/`toSelection`, and `null`
 * rather than `undefined` for the absent endpoints.
 *
 * Structural, not `StockWorkflowApiItem`, so a saved record and anything else
 * carrying the wire fields both work.
 */
export interface WireRuleSides {
  fromSelection: StatusSelectionType | null;
  toSelection: StatusSelectionType | null;
  fromStatuses: OrderStatus[];
  toStatuses: OrderStatus[];
  fromRangeStart: OrderStatus | null;
  fromRangeEnd: OrderStatus | null;
  toRangeStart: OrderStatus | null;
  toRangeEnd: OrderStatus | null;
}

/**
 * Wire record → the shape `sideCoversStatus` reads.
 *
 * Lives here rather than in the coverage panel so the panel and the rule
 * builder cannot end up reading a stored rule two different ways.
 *
 * A null selection (CREATION/INBOUND, which carry no selections at all) falls
 * back to SPECIFIC: over a from-side that is empty by construction that
 * matches NOTHING, which is exactly right — a creation rule covers no
 * transition. Callers still filter by `eventType` first; this is the belt.
 */
export function toStatusRuleSides(rule: WireRuleSides): StatusRuleSides {
  return {
    fromType: rule.fromSelection ?? 'SPECIFIC',
    toType: rule.toSelection ?? 'SPECIFIC',
    fromStatuses: rule.fromStatuses,
    toStatuses: rule.toStatuses,
    fromRangeStart: rule.fromRangeStart ?? undefined,
    fromRangeEnd: rule.fromRangeEnd ?? undefined,
    toRangeStart: rule.toRangeStart ?? undefined,
    toRangeEnd: rule.toRangeEnd ?? undefined,
  };
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
