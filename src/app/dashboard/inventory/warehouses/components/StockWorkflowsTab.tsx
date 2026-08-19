'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { LiaPlusSolid, LiaTrashSolid, LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import PageLoading from '@/components/ui/page-loading';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FormSwitch } from '@/components/ui/form-switch';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import {
  useStockWorkflowsQuery,
  useCreateStockWorkflowMutation,
  useUpdateStockWorkflowMutation,
  useDeleteStockWorkflowMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import type {
  CreateStockWorkflowDto,
  InsufficientStockBehavior,
  StockWorkflowApiItem,
} from '@/lib/api/warehouses';
import {
  EVENT_TYPE_LABEL_KEYS,
  INSUFFICIENT_STOCK_OPTIONS,
  RULE_SCOPE_LABEL_KEYS,
  WORKFLOW_ORDER_STATUSES,
} from '../constants';
import {
  sideKey,
  type RuleSide,
  type StatusRuleSides,
} from '../utils/ruleMatching';
import {
  RuleStatusSideEditor,
  type RuleStatusSidePatch,
} from './RuleStatusSideEditor';
import { StockRuleCoverageNotice } from './StockRuleCoverageNotice';
import { InboundDestinationSection } from './InboundDestinationSection';
import {
  StockRuleScopeSelector,
  type ScopeSelection,
} from './StockRuleScopeSelector';

/**
 * T29 — one rule card's local state.
 *
 * The stored selection TYPES live here, not a re-derivation of them: that is
 * the whole round-trip requirement. A rule saved as RANGE reopens as a range
 * and an ANY side reopens as ANY, instead of coming back as whatever list they
 * happened to expand to at save time.
 *
 * It EXTENDS `StatusRuleSides` rather than restating those fields, so a card
 * can be handed straight to the shared matcher and the two cannot drift.
 *
 * The per-side statuses and range endpoints it inherits are meaningful only
 * for the side's ACTIVE type — with the CREATION carve-out: a creation rule
 * keeps its single target status in `toStatuses`. Values left behind by a type
 * switch are kept on purpose (the merchant may switch back), so nothing there
 * may be shipped without checking the active type first (`buildShapeBody`).
 */
interface RuleRow extends StatusRuleSides {
  /** undefined for rows that have not been saved yet */
  id?: number;
  /**
   * NOT the full wire union: T30's `INBOUND` has its own panel and never
   * becomes a card, so the narrower type makes that unreachable by
   * construction rather than by convention (`isCardRule` is the only door in).
   */
  eventType: EditableEventType;
  fromWarehouseId: string;
  toWarehouseId: string;
  allowNegative: boolean;
  onInsufficient: InsufficientStockBehavior;
  dirty: boolean;
  touched: boolean;
}

/** The status half of the payload — the only part that varies by event type. */
type RuleShapeBody = Pick<
  CreateStockWorkflowDto,
  | 'fromSelection'
  | 'toSelection'
  | 'fromStatuses'
  | 'toStatuses'
  | 'fromRangeStart'
  | 'fromRangeEnd'
  | 'toRangeStart'
  | 'toRangeEnd'
>;

/**
 * The events this builder can author — everything except `INBOUND`, which
 * T30 gives its own panel (`InboundDestinationSection`).
 */
type EditableEventType = keyof typeof EVENT_TYPE_LABEL_KEYS;

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABEL_KEYS) as EditableEventType[];

/** A server rule this builder can actually render as a card. */
type CardRule = StockWorkflowApiItem & { eventType: EditableEventType };

/**
 * The ONLY way a server rule becomes a card.
 *
 * An INBOUND rule has no source warehouse and no statuses, so a card built from
 * one would open showing an empty "من مخزن" and an inline "اختر المخزنين"
 * error on a rule that is perfectly valid — and saving it would ship fields the
 * API rejects. It belongs to the panel above, not here.
 */
const isCardRule = (rule: StockWorkflowApiItem): rule is CardRule =>
  rule.eventType !== 'INBOUND';

const RULE_SIDES: RuleSide[] = ['from', 'to'];

const statusOptions = WORKFLOW_ORDER_STATUSES.map((status) => ({
  key: status,
  value: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
}));

const toRow = (rule: CardRule): RuleRow => ({
  id: rule.id,
  eventType: rule.eventType,
  // CREATION carries no selections at all; SPECIFIC over the arrays it does
  // carry is the reading that keeps the card harmless if the event is ever
  // switched on a fresh row.
  fromType: rule.fromSelection ?? 'SPECIFIC',
  toType: rule.toSelection ?? 'SPECIFIC',
  fromStatuses: rule.fromStatuses,
  toStatuses: rule.toStatuses,
  fromRangeStart: rule.fromRangeStart ?? undefined,
  fromRangeEnd: rule.fromRangeEnd ?? undefined,
  toRangeStart: rule.toRangeStart ?? undefined,
  toRangeEnd: rule.toRangeEnd ?? undefined,
  // Still guarded even though a card rule always has one: the wire type allows
  // null (an INBOUND rule has no source), and `String(null)` would put the text
  // "null" in the picker rather than leaving it unset.
  fromWarehouseId:
    rule.fromWarehouseId == null ? '' : String(rule.fromWarehouseId),
  toWarehouseId: String(rule.toWarehouseId),
  allowNegative: rule.allowNegative,
  onInsufficient: rule.onInsufficient,
  dirty: false,
  touched: false,
});

/**
 * A new card starts as a TRANSITION with both sides SPECIFIC and empty.
 *
 * Not ANY: "every status" is the widest rule the system can hold, and it must
 * not be the thing a merchant gets by adding a card and saving it — it has to
 * be chosen.
 */
const emptyRow = (): RuleRow => ({
  eventType: 'TRANSITION',
  fromType: 'SPECIFIC',
  toType: 'SPECIFIC',
  fromStatuses: [],
  toStatuses: [],
  fromWarehouseId: '',
  toWarehouseId: '',
  allowNegative: false,
  onInsufficient: 'THROW',
  // `dirty` enables Save; `touched` gates inline errors so a freshly added
  // card isn't red before the user has typed anything.
  dirty: true,
  touched: false,
});

const rangeOf = (row: RuleRow, side: RuleSide) =>
  side === 'from'
    ? { start: row.fromRangeStart, end: row.fromRangeEnd }
    : { start: row.toRangeStart, end: row.toRangeEnd };

/**
 * What is wrong with ONE side of a transition, if anything.
 *
 * ANY needs nothing, SPECIFIC needs a non-empty list, RANGE needs two
 * endpoints in the enum's order. Every index goes through
 * `WORKFLOW_ORDER_STATUSES.indexOf` with a `< 0` guard: the frontend
 * `OrderStatus` enum carries 4 legacy values the rules API rejects.
 */
const sideError = (row: RuleRow, side: RuleSide): TranslationKey | null => {
  if (row.eventType !== 'TRANSITION') return null;

  const type = side === 'from' ? row.fromType : row.toType;
  if (type === 'ANY') return null;

  if (type === 'SPECIFIC') {
    const statuses = side === 'from' ? row.fromStatuses : row.toStatuses;
    if (statuses.length > 0) return null;
    return side === 'from'
      ? 'stockRules.errors.fromSpecificEmpty'
      : 'stockRules.errors.toSpecificEmpty';
  }

  const { start, end } = rangeOf(row, side);
  if (!start || !end) return 'stockRules.errors.rangeIncomplete';
  const startIndex = WORKFLOW_ORDER_STATUSES.indexOf(start);
  const endIndex = WORKFLOW_ORDER_STATUSES.indexOf(end);
  if (startIndex < 0 || endIndex < 0) return 'stockRules.errors.rangeIncomplete';
  // No silent auto-swap: swapping would change which statuses the merchant
  // just configured without them asking.
  if (startIndex > endIndex) return 'stockRules.errors.rangeInverted';
  return null;
};

/**
 * Client-side duplicate key, or null for a card too incomplete to compare.
 *
 * Type-prefixed through `sideKey`, so an ANY side and a hand-picked full list
 * are NOT duplicates of each other — they are different rules that happen to
 * cover the same statuses today. Semantic overlap between different shapes is
 * the SERVER's 409 to raise; re-implementing precedence policy here would only
 * give two answers to one question.
 */
const dedupeKey = (row: RuleRow): string | null => {
  if (row.eventType === 'CREATION') {
    return row.toStatuses.length === 1
      ? `CREATION:${row.toStatuses[0]}`
      : null;
  }
  if (row.eventType !== 'TRANSITION') return null;
  if (sideError(row, 'from') || sideError(row, 'to')) return null;
  const from = sideKey(
    row.fromType,
    row.fromStatuses,
    row.fromRangeStart,
    row.fromRangeEnd
  );
  const to = sideKey(
    row.toType,
    row.toStatuses,
    row.toRangeStart,
    row.toRangeEnd
  );
  return `TRANSITION:${from}→${to}`;
};

/**
 * What is wrong with the card as a WHOLE — everything that has no side of its
 * own to be shown under. Kept separate from `sideError` so the footer does not
 * repeat a message already sitting under the editor that caused it.
 */
const cardError = (row: RuleRow, duplicate: boolean): TranslationKey | null => {
  if (row.eventType === 'CREATION') {
    // Exactly one target — the backend's partial unique index is keyed on it.
    if (row.toStatuses.length !== 1)
      return 'stockRules.errors.creationTargetRequired';
  } else if (row.eventType === 'TRANSITION') {
    // SPECIFIC × SPECIFIC only. ANY and RANGE sides are allowed to overlap:
    // the engine's compare-and-set makes an X→X transition unreachable
    // anyway, and rejecting intersections would make "any source → CANCELLED"
    // impossible to create.
    if (
      row.fromType === 'SPECIFIC' &&
      row.toType === 'SPECIFIC' &&
      row.fromStatuses.some((status) => row.toStatuses.includes(status))
    )
      return 'stockRules.errors.sameStatusBothSides';
  }

  // Both events above move stock between two warehouses. The one event that
  // does not — INBOUND, which has a destination and nothing else — cannot
  // reach this function: `RuleRow.eventType` excludes it by type.
  if (!row.fromWarehouseId || !row.toWarehouseId)
    return 'stockRules.errors.warehousesRequired';
  if (row.fromWarehouseId === row.toWarehouseId)
    return 'stockRules.errors.sameWarehouse';
  if (duplicate) {
    return row.eventType === 'CREATION'
      ? 'stockRules.errors.duplicateCreationRule'
      : 'stockRules.errors.duplicateRule';
  }
  return null;
};

/** Everything `cardError` covers PLUS the sides — what blocks a save. */
const rowError = (row: RuleRow, duplicate: boolean): TranslationKey | null => {
  const from = sideError(row, 'from');
  if (from) return from;
  const to = sideError(row, 'to');
  if (to) return to;
  return cardError(row, duplicate);
};

/**
 * The event-specific half of the payload: ONLY the fields the active event and
 * selection types use.
 *
 * This is why a stale range left behind by a type switch is harmless — a
 * SPECIFIC side ships its statuses and nothing else, a RANGE side its two
 * endpoints and nothing else, and an ANY side the selection alone. The backend
 * CHECK constraints reject hybrid rows, so shipping the leftovers would be a
 * 400 on a card that looks perfectly valid.
 *
 * The null return is now unreachable — `RuleRow.eventType` is CREATION or
 * TRANSITION and nothing else — and stays only as the caller's belt-and-braces
 * against a third editable event being added without a payload shape.
 */
const buildShapeBody = (row: RuleRow): RuleShapeBody | null => {
  if (row.eventType === 'CREATION') {
    // The single target lives in `toStatuses`, with no selections at all.
    return { toStatuses: row.toStatuses };
  }
  if (row.eventType !== 'TRANSITION') return null;

  return {
    ...(row.fromType === 'ANY'
      ? { fromSelection: 'ANY' as const }
      : row.fromType === 'RANGE'
        ? {
            fromSelection: 'RANGE' as const,
            fromRangeStart: row.fromRangeStart,
            fromRangeEnd: row.fromRangeEnd,
          }
        : {
            fromSelection: 'SPECIFIC' as const,
            fromStatuses: row.fromStatuses,
          }),
    ...(row.toType === 'ANY'
      ? { toSelection: 'ANY' as const }
      : row.toType === 'RANGE'
        ? {
            toSelection: 'RANGE' as const,
            toRangeStart: row.toRangeStart,
            toRangeEnd: row.toRangeEnd,
          }
        : { toSelection: 'SPECIFIC' as const, toStatuses: row.toStatuses }),
  };
};

/**
 * Side-agnostic editor patch → side-prefixed row patch.
 *
 * Keyed on PRESENCE (`in`), not on the value being defined: clearing a range
 * endpoint arrives as an explicit `undefined` and has to land as `undefined`,
 * which an "only copy defined values" merge would silently drop — leaving the
 * old endpoint in place and the picker showing a range the merchant cleared.
 */
const toRowPatch = (
  side: RuleSide,
  patch: RuleStatusSidePatch
): Partial<RuleRow> =>
  side === 'from'
    ? {
        ...('type' in patch ? { fromType: patch.type } : {}),
        ...('statuses' in patch ? { fromStatuses: patch.statuses } : {}),
        ...('rangeStart' in patch ? { fromRangeStart: patch.rangeStart } : {}),
        ...('rangeEnd' in patch ? { fromRangeEnd: patch.rangeEnd } : {}),
      }
    : {
        ...('type' in patch ? { toType: patch.type } : {}),
        ...('statuses' in patch ? { toStatuses: patch.statuses } : {}),
        ...('rangeStart' in patch ? { toRangeStart: patch.rangeStart } : {}),
        ...('rangeEnd' in patch ? { toRangeEnd: patch.rangeEnd } : {}),
      };

export function StockWorkflowsTab() {
  const { t, dir } = useI18n();

  // T28 — the screen edits ONE scope at a time. The query filter is exact, so
  // what is listed is exactly what governs this scope: the global rules are not
  // mixed in, because whether this scope has rules of its own is precisely what
  // decides whether the global ones apply to it at all.
  const [scope, setScope] = useState<ScopeSelection>({ scope: 'GLOBAL' });

  const scopeIsReady =
    scope.scope === 'GLOBAL' ||
    (scope.scope === 'PRODUCT' && scope.productId != null) ||
    (scope.scope === 'VARIANT' && scope.variantId != null);

  const { data, isLoading, isError } = useStockWorkflowsQuery(
    scope.scope === 'GLOBAL'
      ? undefined
      : { productId: scope.productId, variantId: scope.variantId }
  );
  // `pickerOptions`, not `options`: a rule WRITES a warehouse id, and an
  // inactive warehouse must not be the one it writes. It still renders (marked
  // disabled) so a rule saved before the deactivation re-displays its warehouse
  // instead of coming back blank.
  const { pickerOptions: warehouseOptions } = useWarehouseOptions();

  const createMutation = useCreateStockWorkflowMutation();
  const updateMutation = useUpdateStockWorkflowMutation();
  const deleteMutation = useDeleteStockWorkflowMutation();

  const [rows, setRows] = useState<RuleRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  /**
   * Narrow to EXACTLY this scope's rules.
   *
   * The server filter already does this for a product or variant, but an
   * unfiltered request returns every rule the merchant has — including the
   * scoped ones — so the global view has to exclude them here. Showing a
   * product's rule under "كل المنتجات" would suggest it applies everywhere,
   * which is the opposite of what it does.
   */
  const scopedRules = useMemo(() => {
    if (!data) return [];
    if (scope.scope === 'GLOBAL') {
      return data.filter(
        (rule) => rule.productId === null && rule.variantId === null
      );
    }
    if (scope.scope === 'PRODUCT') {
      return scope.productId == null
        ? []
        : data.filter((rule) => rule.productId === scope.productId);
    }
    return scope.variantId == null
      ? []
      : data.filter((rule) => rule.variantId === scope.variantId);
  }, [data, scope]);

  /**
   * T30 — the same fetch feeds two surfaces, split by event type.
   *
   * At most one INBOUND rule can exist per scope (the backend enforces it), so
   * `find` is the whole story; everything else is a card.
   */
  const inboundRule = useMemo(
    () => scopedRules.find((rule) => rule.eventType === 'INBOUND'),
    [scopedRules]
  );

  const cardRules = useMemo(() => scopedRules.filter(isCardRule), [scopedRules]);

  const scopeKey = `${scope.scope}:${scope.productId ?? ''}:${scope.variantId ?? ''}`;

  // Switching scope discards in-progress cards: an unsaved card carries the old
  // scope's meaning, and silently re-parenting it to the new scope would create
  // a rule the user never asked for.
  useEffect(() => {
    setRows([]);
  }, [scopeKey]);

  // Reconcile server rules into local rows WITHOUT discarding work in progress:
  // a refetch (triggered by every save/delete) must not wipe unsaved cards or
  // dirty edits the user is still typing.
  useEffect(() => {
    setRows((current) => {
      const dirtyById = new Map(
        current.filter((row) => row.dirty && row.id).map((row) => [row.id, row])
      );
      const unsaved = current.filter((row) => !row.id);
      const serverRows = cardRules.map(
        (rule) => dirtyById.get(rule.id) ?? toRow(rule)
      );
      return [...serverRows, ...unsaved];
    });
  }, [cardRules]);

  // Flag only the SECOND and later occurrences: the already-saved first card
  // must not turn red because someone started typing a clashing new one.
  const duplicateRowIndexes = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<number>();
    rows.forEach((row, index) => {
      const key = dedupeKey(row);
      if (key === null) return;
      if (seen.has(key)) dupes.add(index);
      seen.add(key);
    });
    return dupes;
  }, [rows]);

  const patchRow = (index: number, patch: Partial<RuleRow>) => {
    setRows((current) =>
      current.map((row, i) =>
        // Plain spread: an explicit `undefined` in the patch has to win, so a
        // cleared range endpoint actually clears.
        i === index ? { ...row, ...patch, dirty: true, touched: true } : row
      )
    );
  };

  const patchSide = (
    index: number,
    side: RuleSide,
    patch: RuleStatusSidePatch
  ) => patchRow(index, toRowPatch(side, patch));

  const saveRow = async (index: number) => {
    const row = rows[index];
    const error = rowError(row, duplicateRowIndexes.has(index));
    if (error) {
      toast.error(t(error));
      return;
    }

    const shape = buildShapeBody(row);
    if (!shape) {
      toast.error(t('stockRules.saveFailed'));
      return;
    }

    const settings = {
      fromWarehouseId: Number(row.fromWarehouseId),
      toWarehouseId: Number(row.toWarehouseId),
      allowNegative: row.allowNegative,
      onInsufficient: row.onInsufficient,
    };

    const rowKey = row.id ? `rule-${row.id}` : `new-${index}`;
    setSavingKey(rowKey);
    try {
      if (row.id) {
        // Scope AND event type are fixed at creation, so an update carries
        // neither. Every side is sent whole — the API merges a side wholesale.
        await updateMutation.mutateAsync({
          id: row.id,
          body: { ...shape, ...settings },
        });
        // Clear dirty so the merge effect stops preferring the local copy
        // and the Save button confirms the write landed.
        setRows((current) =>
          current.map((r, i) =>
            i === index ? { ...r, dirty: false, touched: false } : r
          )
        );
      } else {
        const created = await createMutation.mutateAsync({
          eventType: row.eventType,
          ...shape,
          ...settings,
          // The new rule belongs to whichever scope the screen is editing.
          ...(scope.scope === 'PRODUCT' ? { productId: scope.productId } : {}),
          ...(scope.scope === 'VARIANT' ? { variantId: scope.variantId } : {}),
        });
        // Adopt the server row (with its id) — otherwise the refetch brings
        // the rule back as a NEW card while the id-less local row survives
        // the merge, leaving a duplicate ghost flagged as a conflict.
        //
        // The response echoes the event type just sent, which is a card event
        // by construction; the guard is only how that reaches the type system.
        if (isCardRule(created)) {
          setRows((current) =>
            current.map((r, i) => (i === index ? toRow(created) : r))
          );
        }
      }
      toast.success(t('stockRules.saveSuccess'));
    } catch (err: unknown) {
      // A rule that semantically overlaps an existing one comes back as a 409
      // from the server, which owns precedence policy — the client does not
      // second-guess it, it just shows what came back.
      toast.error(getApiErrorMessage(err, t('stockRules.saveFailed')));
    } finally {
      setSavingKey(null);
    }
  };

  const removeRow = (index: number) => {
    const row = rows[index];
    if (!row.id) {
      setRows((current) => current.filter((_, i) => i !== index));
      return;
    }
    setPendingDelete(row.id);
  };

  const confirmDelete = async () => {
    if (pendingDelete == null) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete);
      toast.success('تم حذف القاعدة');
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف القاعدة'));
    }
  };

  const scopeLabel = t(RULE_SCOPE_LABEL_KEYS[scope.scope]);

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-red-500">
        تعذر تحميل قواعد حركة المخزون
      </p>
    );
  }

  const scopePicker = (
    <StockRuleScopeSelector value={scope} onChange={setScope} />
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {scopePicker}
        <PageLoading size="sm" className="min-h-0 py-10" />
      </div>
    );
  }

  // A half-chosen scope must not fall back to the global list — the rules shown
  // would not be the rules being edited.
  if (!scopeIsReady) {
    return (
      <div className="space-y-4">
        {scopePicker}
        <p className="py-8 text-center text-sm text-gray-500">
          {scope.scope === 'PRODUCT'
            ? 'اختر منتجًا لعرض قواعده الخاصة.'
            : 'اختر منتجًا ثم متغيرًا لعرض قواعده الخاصة.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={dir}>
      <p className="text-sm text-gray-500">{t('stockRules.intro')}</p>

      {scopePicker}

      {/* Coverage is about the TRANSITION/CREATION rules only — an inbound
          destination neither fills nor causes a restock gap, so it is not in
          the list this panel reasons over. */}
      {scope.scope !== 'GLOBAL' && (
        <StockRuleCoverageNotice rules={cardRules} scopeLabel={scopeLabel} />
      )}

      <InboundDestinationSection
        scope={scope}
        scopeKey={scopeKey}
        inboundRule={inboundRule}
      />

      <div className="space-y-4">
        {rows.map((row, index) => {
          const rowKey = row.id ? `rule-${row.id}` : `new-${index}`;
          const isSaving = savingKey === rowKey;
          // Card-level only: the side errors are rendered under their own
          // editors, so repeating them next to Save would say each twice.
          const error = row.touched
            ? cardError(row, duplicateRowIndexes.has(index))
            : null;
          const eventLabelKey = EVENT_TYPE_LABEL_KEYS[row.eventType];
          // The creation target is a single status kept in `toStatuses`; a
          // leftover multi-selection from a TRANSITION card reads as "not
          // chosen yet" rather than silently picking its first entry.
          const creationTarget =
            row.toStatuses.length === 1 ? row.toStatuses[0] : '';

          return (
            <div
              key={rowKey}
              className="space-y-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <span className="block text-xs font-medium text-gray-600">
                    {t('stockRules.event.label')}
                  </span>
                  {row.id ? (
                    // The event type is fixed at creation — what fires a rule
                    // is what the rule IS. Changing it means a new rule, so a
                    // saved card shows it rather than offering it.
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
                      {t(eventLabelKey)}
                    </span>
                  ) : (
                    <div className="flex gap-1.5">
                      {EVENT_TYPES.map((event) => (
                        <button
                          key={event}
                          type="button"
                          onClick={() => patchRow(index, { eventType: event })}
                          className={`rounded-full border px-2 py-1 text-[11px] ${
                            row.eventType === event
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          {t(EVENT_TYPE_LABEL_KEYS[event])}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => removeRow(index)}
                >
                  <LiaTrashSolid className="size-4" />
                </Button>
              </div>

              {row.eventType === 'CREATION' && (
                <div className="max-w-sm space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    {t('stockRules.side.to')}
                  </label>
                  <SearchableSelect
                    options={statusOptions}
                    value={creationTarget}
                    onValueChange={(next) =>
                      patchRow(index, {
                        toStatuses: next ? [next as OrderStatus] : [],
                      })
                    }
                    placeholder={t('stockRules.side.to')}
                  />
                </div>
              )}

              {row.eventType === 'TRANSITION' && (
                <div className="grid gap-4 md:grid-cols-2">
                  {RULE_SIDES.map((side) => {
                    const key = row.touched ? sideError(row, side) : null;
                    // An inverted range is reported by `StatusRangePicker`
                    // itself, directly under the endpoints that caused it —
                    // repeating it here would just say it twice.
                    const shown =
                      key === 'stockRules.errors.rangeInverted' ? null : key;
                    const range = rangeOf(row, side);

                    return (
                      <div key={side} className="space-y-1">
                        <RuleStatusSideEditor
                          side={side}
                          type={side === 'from' ? row.fromType : row.toType}
                          statuses={
                            side === 'from' ? row.fromStatuses : row.toStatuses
                          }
                          rangeStart={range.start}
                          rangeEnd={range.end}
                          onPatch={(patch) => patchSide(index, side, patch)}
                        />
                        {shown && (
                          <p className="text-[11px] text-red-500">{t(shown)}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    من مخزن
                  </label>
                  <SearchableSelect
                    options={warehouseOptions}
                    value={row.fromWarehouseId}
                    onValueChange={(next) =>
                      patchRow(index, { fromWarehouseId: next })
                    }
                    placeholder="من مخزن"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    إلى مخزن
                  </label>
                  <SearchableSelect
                    options={warehouseOptions}
                    value={row.toWarehouseId}
                    onValueChange={(next) =>
                      patchRow(index, { toWarehouseId: next })
                    }
                    placeholder="إلى مخزن"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    السماح بالسالب
                  </label>
                  <FormSwitch
                    checked={row.allowNegative}
                    onCheckedChange={(checked) =>
                      patchRow(index, { allowNegative: checked })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    عند عدم الكفاية
                  </label>
                  <SearchableSelect
                    options={INSUFFICIENT_STOCK_OPTIONS}
                    value={row.onInsufficient}
                    onValueChange={(next) =>
                      patchRow(index, {
                        onInsufficient: next as InsufficientStockBehavior,
                      })
                    }
                    placeholder="عند عدم الكفاية"
                    disabled={row.allowNegative}
                  />
                  <p className="text-[11px] leading-4 text-gray-400">
                    {row.allowNegative
                      ? 'يتم تنفيذ الحركة حتى لو كانت الكمية غير كافية'
                      : row.onInsufficient === 'THROW'
                        ? 'يُمنع تغيير حالة الطلب عند نقص المخزون'
                        : 'يتم تخطي الحركة وتستمر حالة الطلب'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                <Button
                  size="sm"
                  onClick={() => saveRow(index)}
                  disabled={!row.dirty || isSaving}
                  loading={isSaving}
                >
                  <LiaSaveSolid className="me-1 size-4" />
                  حفظ
                </Button>
                {error && (
                  <p className="text-[11px] text-red-500">{t(error)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          {scope.scope === 'GLOBAL'
            ? 'لا توجد قواعد بعد — لن يتحرك المخزون تلقائيًا عند تغيير حالات الطلبات.'
            : 'لا توجد قواعد خاصة بهذا النطاق — تُطبق عليه القواعد العامة. بإضافة أول قاعدة هنا ستتوقف القواعد العامة عنه تمامًا.'}
        </p>
      )}

      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setRows((current) => [...current, emptyRow()])}
      >
        <LiaPlusSolid className="me-1 size-4" />
        إضافة قاعدة
      </Button>

      <BaseModal
        isOpen={pendingDelete != null}
        onClose={() => setPendingDelete(null)}
        title="حذف القاعدة"
        confirmText="حذف"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[420px]"
      >
        <p className="text-sm text-gray-600">
          بحذف هذه القاعدة لن يتحرك المخزون عند هذا التحويل بين الحالات.
        </p>
      </BaseModal>
    </div>
  );
}
