'use client';

import { useMemo } from 'react';
import { LiaUnlinkSolid } from 'react-icons/lia';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import { useI18n } from '@/i18n/I18nProvider';
import type { StockWorkflowApiItem } from '@/lib/api/warehouses';
import {
  RESTOCK_SOURCE_STATUSES,
  RESTOCK_TARGET_STATUSES,
} from '../constants';
import { sideCoversStatus, toStatusRuleSides } from '../utils/ruleMatching';

interface Props {
  /** Rules belonging to THIS scope only — never the inherited ones. */
  rules: StockWorkflowApiItem[];
  scopeLabel: string;
}

// Status names have no English catalogue yet — `ORDER_STATUS_ARABIC_LABELS` is
// the whole dashboard's fallback map, so they stay Arabic under an English UI
// until that map grows a second locale.
const label = (status: OrderStatus) =>
  ORDER_STATUS_ARABIC_LABELS[status] ?? status;

/**
 * T28 — the mitigation for the all-or-nothing decision, and the reason this
 * component is not optional.
 *
 * A scope with even one rule stops inheriting EVERYTHING above it. The reporter
 * accepted that, but without this panel a merchant who overrides one warehouse
 * silently loses restocking and has no way to see it — the same invisible
 * failure T14 was created to fix.
 *
 * So the restock transitions are checked by name and, when this scope does not
 * cover them, said plainly.
 */
export function StockRuleCoverageNotice({ rules, scopeLabel }: Props) {
  const { t, dir } = useI18n();

  const uncoveredRestock = useMemo(() => {
    // T29 — the event type says what a rule fires on; an empty `fromStatuses`
    // no longer does. Coverage is then read through the SHARED matcher, so an
    // ANY or RANGE rule is credited for the statuses it actually covers
    // instead of being reported as a phantom gap.
    const transitionSides = rules
      .filter((rule) => rule.eventType === 'TRANSITION')
      .map(toStatusRuleSides);

    const covers = (from: OrderStatus, to: OrderStatus) =>
      transitionSides.some(
        (sides) =>
          sideCoversStatus(sides, 'from', from) &&
          sideCoversStatus(sides, 'to', to)
      );

    const gaps: string[] = [];
    for (const from of RESTOCK_SOURCE_STATUSES) {
      const missing = RESTOCK_TARGET_STATUSES.filter((to) => !covers(from, to));
      if (missing.length > 0) {
        // Templated, not concatenated: the arrow points along the reading
        // direction and the list separator is an Arabic comma, so both belong
        // to the catalogue rather than to this loop.
        gaps.push(
          t('stockRules.coverage.gapLine', {
            from: label(from),
            targets: missing
              .map(label)
              .join(t('stockRules.coverage.gapTargetSeparator')),
          })
        );
      }
    }
    return gaps;
  }, [rules, t]);

  const hasCreationRule = rules.some((rule) => rule.eventType === 'CREATION');

  // No rules at all means the scope is not governing anything yet, so the
  // global rules still apply and there is nothing to warn about.
  if (rules.length === 0) return null;
  if (uncoveredRestock.length === 0 && hasCreationRule) return null;

  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900"
      dir={dir}
    >
      <div className="flex items-start gap-2">
        {/* A broken link, not a warning triangle: the message is that this
            scope has SEVERED its inheritance from the rules above it. A hazard
            glyph says "something is wrong"; nothing is wrong, the merchant
            chose this — what they need to see is that the chain is cut. */}
        <LiaUnlinkSolid className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2 text-xs leading-5">
          <p className="font-semibold">
            {t('stockRules.coverage.header', { scope: scopeLabel })}
          </p>

          {!hasCreationRule && (
            <p>{t('stockRules.coverage.noCreationRule')}</p>
          )}

          {uncoveredRestock.length > 0 && (
            <div>
              {/* Three fragments rather than one string with markup in it: the
                  emphasis sits mid-sentence and each language puts it in a
                  different place. The spaces are JSX, not copy. */}
              <p>
                {t('stockRules.coverage.gapsIntro')}{' '}
                <span className="font-semibold">
                  {t('stockRules.coverage.gapsEmphasis')}
                </span>{' '}
                {t('stockRules.coverage.gapsIntroTail')}
              </p>
              <ul className="mt-1 list-disc ps-4">
                {uncoveredRestock.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
              <p className="mt-1">
                {t('stockRules.coverage.addRestockRule')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
