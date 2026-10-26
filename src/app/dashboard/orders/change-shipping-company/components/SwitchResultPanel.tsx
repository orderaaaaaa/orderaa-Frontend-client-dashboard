'use client';

import Link from 'next/link';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import { isCancelListRow } from '../hooks/useChangeCompanyRows';
import {
  BULK_COMPANY_SWITCH_OUTCOME,
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyRow as ChangeCompanyRowState,
} from '../types/bulkCompanySwitch';
import { rowMessageOf } from './ChangeCompanyRow';

export interface SwitchResultSections {
  switched: ChangeCompanyRowState[];
  cancelOld: ChangeCompanyRowState[];
  notSwitched: ChangeCompanyRowState[];
  skipped: ChangeCompanyRowState[];
}

type SectionKey = keyof SwitchResultSections;

function sectionOf(row: ChangeCompanyRowState): SectionKey | null {
  if (isCancelListRow(row)) return 'cancelOld';
  switch (row.status) {
    case CHANGE_COMPANY_ROW_STATUS.DONE: {
      const outcome = row.result?.outcome;
      if (
        outcome === BULK_COMPANY_SWITCH_OUTCOME.SWITCHED ||
        outcome === BULK_COMPANY_SWITCH_OUTCOME.UPDATED
      ) {
        return 'switched';
      }
      if (outcome === BULK_COMPANY_SWITCH_OUTCOME.NOT_SWITCHED) return 'notSwitched';
      if (outcome === BULK_COMPANY_SWITCH_OUTCOME.SKIPPED) return 'skipped';
      return null;
    }
    case CHANGE_COMPANY_ROW_STATUS.ERROR:
    case CHANGE_COMPANY_ROW_STATUS.ERROR_UNKNOWN:
      return 'notSwitched';
    case CHANGE_COMPANY_ROW_STATUS.SKIPPED:
    case CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL:
      return 'skipped';
    default:
      return null;
  }
}

export function resultSectionsOf(rows: ChangeCompanyRowState[]): SwitchResultSections {
  const sections: SwitchResultSections = {
    switched: [],
    cancelOld: [],
    notSwitched: [],
    skipped: [],
  };
  for (const row of rows) {
    const key = sectionOf(row);
    if (key !== null) sections[key].push(row);
  }
  return sections;
}

interface SwitchResultPanelProps {
  rows: ChangeCompanyRowState[];
  targetName: string;
}

const SECTION_TITLES: Record<SectionKey, string> = {
  switched: CHANGE_COMPANY_TEXT.resultSwitched,
  cancelOld: CHANGE_COMPANY_TEXT.resultCancelOld,
  notSwitched: CHANGE_COMPANY_TEXT.resultNotSwitched,
  skipped: CHANGE_COMPANY_TEXT.resultSkipped,
};

const SECTION_ORDER: SectionKey[] = ['switched', 'cancelOld', 'notSwitched', 'skipped'];

function ResultItem({
  row,
  section,
  targetName,
}: {
  row: ChangeCompanyRowState;
  section: SectionKey;
  targetName: string;
}) {
  const detail =
    section === 'cancelOld'
      ? `${row.result?.previousCompany?.name ?? ''}: ${
          row.result?.previousShippingId ?? CHANGE_COMPANY_TEXT.resultOldIdMissing
        }`
      : rowMessageOf(row, targetName);
  return (
    <li className="flex flex-col gap-1 p-3 text-sm">
      <Link
        href={`/dashboard/orders/${row.order.id}`}
        className="font-mono text-primary hover:underline"
      >
        {row.order.code}
      </Link>
      <span className="break-words text-gray-700">{detail}</span>
    </li>
  );
}

export function SwitchResultPanel({ rows, targetName }: SwitchResultPanelProps) {
  const sections = resultSectionsOf(rows);
  return (
    <div className="flex flex-col gap-4">
      {SECTION_ORDER.filter((key) => sections[key].length > 0).map((key) => (
        <section key={key} className="rounded-md border bg-white">
          <h2 className="border-b px-3 py-2 text-sm font-semibold text-gray-900">
            {`${SECTION_TITLES[key]} (${sections[key].length})`}
          </h2>
          <ul className="divide-y">
            {sections[key].map((row) => (
              <ResultItem
                key={row.order.id}
                row={row}
                section={key}
                targetName={targetName}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
