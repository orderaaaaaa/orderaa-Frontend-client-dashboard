'use client';

import { useMemo } from 'react';
import { LiaExclamationTriangleSolid } from 'react-icons/lia';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import type { StockWorkflowApiItem } from '@/lib/api/warehouses';
import {
  RESTOCK_SOURCE_STATUSES,
  RESTOCK_TARGET_STATUSES,
} from '../constants';

interface Props {
  /** Rules belonging to THIS scope only — never the inherited ones. */
  rules: StockWorkflowApiItem[];
  scopeLabel: string;
}

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
  const uncoveredRestock = useMemo(() => {
    const transitionRules = rules.filter((rule) => rule.fromStatuses.length > 0);

    const covers = (from: OrderStatus, to: OrderStatus) =>
      transitionRules.some(
        (rule) =>
          rule.fromStatuses.includes(from) &&
          // An empty target set means "any target".
          (rule.toStatuses.length === 0 || rule.toStatuses.includes(to))
      );

    const gaps: string[] = [];
    for (const from of RESTOCK_SOURCE_STATUSES) {
      const missing = RESTOCK_TARGET_STATUSES.filter((to) => !covers(from, to));
      if (missing.length > 0) {
        gaps.push(
          `${label(from)} ← ${missing.map(label).join('، ')}`
        );
      }
    }
    return gaps;
  }, [rules]);

  const hasCreationRule = rules.some((rule) => rule.fromStatuses.length === 0);

  // No rules at all means the scope is not governing anything yet, so the
  // global rules still apply and there is nothing to warn about.
  if (rules.length === 0) return null;
  if (uncoveredRestock.length === 0 && hasCreationRule) return null;

  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900"
      dir="rtl"
    >
      <div className="flex items-start gap-2">
        <LiaExclamationTriangleSolid className="mt-0.5 size-4 shrink-0" />
        <div className="space-y-2 text-xs leading-5">
          <p className="font-semibold">
            هذا النطاق ({scopeLabel}) له قواعده الخاصة، لذلك لا تُطبق عليه
            القواعد العامة إطلاقًا.
          </p>

          {!hasCreationRule && (
            <p>
              لا توجد قاعدة «عند إنشاء الطلب» في هذا النطاق — لن يخرج المخزون عند
              إنشاء طلب يحتوي عليه، حتى لو كانت هناك قاعدة إنشاء عامة.
            </p>
          )}

          {uncoveredRestock.length > 0 && (
            <div>
              <p>
                التحويلات التالية (رجوع الطلب من التغليف إلى خدمة العملاء)
                <span className="font-semibold"> لا تحرّك أي مخزون </span>
                في هذا النطاق:
              </p>
              <ul className="mt-1 list-disc pr-4">
                {uncoveredRestock.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
              <p className="mt-1">
                أضف قاعدة إرجاع لهذا النطاق إذا كنت تريد إعادة المخزون في هذه
                الحالات.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
