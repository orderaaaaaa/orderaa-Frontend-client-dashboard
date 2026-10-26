'use client';

import Link from 'next/link';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import type { ChangeCompanyRow as ChangeCompanyRowState } from '../types/bulkCompanySwitch';
import {
  SECTION_ORDER,
  SECTION_TITLES,
  resultSectionsOf,
  rowMessageOf,
  type SectionKey,
} from '../utils/switchResults';

interface SwitchResultPanelProps {
  rows: ChangeCompanyRowState[];
  targetName: string;
}

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
