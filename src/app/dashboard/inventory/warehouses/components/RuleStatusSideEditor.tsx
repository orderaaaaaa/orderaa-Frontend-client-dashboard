'use client';

import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { useI18n } from '@/i18n/I18nProvider';
import type { TranslationKey } from '@/i18n/translate';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { WORKFLOW_ORDER_STATUSES } from '../constants';
import type { StatusSelectionType } from '../utils/ruleMatching';
import { StatusRangePicker } from './StatusRangePicker';

// Same build as `StockWorkflowsTab`'s `statusOptions` — a static module-scope
// map, not a per-render `useMemo`. Status labels stay Arabic under the
// English UI, matching the rest of the stock-rules screen.
const statusOptions = WORKFLOW_ORDER_STATUSES.map((status) => ({
  key: status,
  value: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
}));

const SELECTION_TYPES: StatusSelectionType[] = ['ANY', 'RANGE', 'SPECIFIC'];

const SELECTION_LABEL_KEYS: Record<StatusSelectionType, TranslationKey> = {
  ANY: 'stockRules.selection.any',
  RANGE: 'stockRules.selection.range',
  SPECIFIC: 'stockRules.selection.specific',
};

/** Patch shape `onPatch` receives — only the fields that changed. */
export interface RuleStatusSidePatch {
  type?: StatusSelectionType;
  statuses?: OrderStatus[];
  rangeStart?: OrderStatus;
  rangeEnd?: OrderStatus;
}

export interface RuleStatusSideEditorProps {
  side: 'from' | 'to';
  type: StatusSelectionType;
  statuses: OrderStatus[];
  rangeStart?: OrderStatus;
  rangeEnd?: OrderStatus;
  onPatch: (patch: RuleStatusSidePatch) => void;
}

/**
 * T29 — one side (`from` or `to`) of a rule's status match: a segmented
 * ANY/RANGE/SPECIFIC control plus the body for whichever type is active.
 * Reused for both sides — `side` only picks the hint copy, the rest of the
 * behaviour is identical.
 *
 * Not wired into `StockWorkflowsTab` yet. The wiring task constructs
 * `RuleRow`s with `fromType`/`toType` etc. and renders one of these per side;
 * until then this component has no caller.
 */
export function RuleStatusSideEditor({
  side,
  type,
  statuses,
  rangeStart,
  rangeEnd,
  onPatch,
}: RuleStatusSideEditorProps) {
  const { t, dir } = useI18n();

  return (
    <div className="space-y-2" dir={dir}>
      <label className="block text-xs font-medium text-gray-600">
        {t(side === 'from' ? 'stockRules.side.from' : 'stockRules.side.to')}
      </label>

      <div className="flex gap-1.5">
        {SELECTION_TYPES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onPatch({ type: option })}
            className={`text-[11px] px-2 py-1 rounded-full border ${
              type === option
                ? 'bg-primary text-white border-primary'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            {t(SELECTION_LABEL_KEYS[option])}
          </button>
        ))}
      </div>

      {type === 'ANY' && (
        <p className="text-[11px] leading-4 text-gray-500">
          {t(
            side === 'from'
              ? 'stockRules.selection.anyFromHint'
              : 'stockRules.selection.anyToHint'
          )}
        </p>
      )}

      {type === 'RANGE' && (
        <StatusRangePicker
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onChange={(nextStart, nextEnd) =>
            onPatch({ rangeStart: nextStart, rangeEnd: nextEnd })
          }
        />
      )}

      {type === 'SPECIFIC' && (
        <MultiSelectDropdown
          options={statusOptions}
          value={statuses}
          onChange={(next) => onPatch({ statuses: next as OrderStatus[] })}
          showSelectAll
        />
      )}
    </div>
  );
}
