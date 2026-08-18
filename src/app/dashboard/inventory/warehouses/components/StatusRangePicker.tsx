'use client';

import { useMemo } from 'react';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useI18n } from '@/i18n/I18nProvider';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { WORKFLOW_ORDER_STATUSES } from '../constants';
import { expandRange } from '../utils/ruleMatching';

// Same build as `StockWorkflowsTab`'s `statusOptions`: a plain module-scope
// map over the one valid order, not a per-render `useMemo` — the source list
// is static. Status labels stay Arabic under the English UI (no English
// catalogue for them yet), matching the rest of the stock-rules screen.
const statusOptions = WORKFLOW_ORDER_STATUSES.map((status) => ({
  key: status,
  value: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
}));

const label = (status: OrderStatus) => ORDER_STATUS_ARABIC_LABELS[status] ?? status;

export interface StatusRangePickerProps {
  rangeStart?: OrderStatus;
  rangeEnd?: OrderStatus;
  onChange: (rangeStart: OrderStatus | undefined, rangeEnd: OrderStatus | undefined) => void;
}

/**
 * T29 — start/end pickers for a RANGE-type rule side, over the single valid
 * status order (`WORKFLOW_ORDER_STATUSES`). Not wired into the rule builder
 * yet; `RuleStatusSideEditor` renders it once the wiring task lands.
 *
 * Inverted ranges (start after end) are reported inline, never silently
 * swapped — an auto-swap would change which statuses a merchant just
 * configured without them asking for it.
 */
export function StatusRangePicker({
  rangeStart,
  rangeEnd,
  onChange,
}: StatusRangePickerProps) {
  const { t, dir } = useI18n();

  const startIndex = rangeStart ? WORKFLOW_ORDER_STATUSES.indexOf(rangeStart) : -1;
  const endIndex = rangeEnd ? WORKFLOW_ORDER_STATUSES.indexOf(rangeEnd) : -1;
  const isInverted = startIndex >= 0 && endIndex >= 0 && startIndex > endIndex;

  const preview = useMemo(() => {
    if (!rangeStart || !rangeEnd || isInverted) return [];
    return expandRange(rangeStart, rangeEnd);
  }, [rangeStart, rangeEnd, isInverted]);

  return (
    <div className="space-y-2" dir={dir}>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {t('stockRules.range.start')}
          </label>
          <SearchableSelect
            options={statusOptions}
            value={rangeStart ?? ''}
            onValueChange={(next) =>
              onChange((next || undefined) as OrderStatus | undefined, rangeEnd)
            }
            placeholder={t('stockRules.range.start')}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            {t('stockRules.range.end')}
          </label>
          <SearchableSelect
            options={statusOptions}
            value={rangeEnd ?? ''}
            onValueChange={(next) =>
              onChange(rangeStart, (next || undefined) as OrderStatus | undefined)
            }
            placeholder={t('stockRules.range.end')}
          />
        </div>
      </div>

      {isInverted && (
        <p className="text-xs text-red-500">
          {t('stockRules.errors.rangeInverted')}
        </p>
      )}

      {preview.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-600">
            {t('stockRules.range.previewLabel', { count: preview.length })}
          </p>
          {/* Chips flow with the active locale's direction, not hardcoded RTL:
              the wrapping div above already carries `dir`, and `flex-wrap`
              needs no directional class of its own to follow it. */}
          <div className="flex flex-wrap gap-1">
            {preview.map((status) => (
              <span
                key={status}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {label(status)}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] leading-4 text-gray-400">
        {t('stockRules.range.futureNote')}
      </p>
    </div>
  );
}
