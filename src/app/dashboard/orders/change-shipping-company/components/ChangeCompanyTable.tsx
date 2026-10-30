'use client';

import { StackedList } from '@/components/ui/stacked-list';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import { useChangeCompanyLocations } from '../hooks/useChangeCompanyLocations';
import type { ChangeCompanyRow as ChangeCompanyRowState } from '../types/bulkCompanySwitch';
import type { PickOption } from '../utils/switchRows';
import { ChangeCompanyRow } from './ChangeCompanyRow';

const TABLE_HEAD = [
  CHANGE_COMPANY_TEXT.colCode,
  CHANGE_COMPANY_TEXT.colStatus,
  CHANGE_COMPANY_TEXT.colAddress,
  CHANGE_COMPANY_TEXT.colCurrentCompany,
  CHANGE_COMPANY_TEXT.colGovernorate,
  CHANGE_COMPANY_TEXT.colCity,
  CHANGE_COMPANY_TEXT.colResult,
];

interface ChangeCompanyTableProps {
  rows: ChangeCompanyRowState[];
  targetId: number | null;
  targetName: string;
  disabled: boolean;
  onPatch: (orderId: number, patch: Partial<ChangeCompanyRowState>) => void;
  onPickGovernorate: (orderId: number, option: PickOption | null) => void;
  onPickCity: (orderId: number, option: PickOption | null) => void;
}

export function ChangeCompanyTable({
  rows,
  targetId,
  targetName,
  disabled,
  onPatch,
  onPickGovernorate,
  onPickCity,
}: ChangeCompanyTableProps) {
  const { getStatusLabel } = useStatusLabel();
  const { governorateQuery, governorateOptions, cityOptionsByRow } =
    useChangeCompanyLocations({
      rows,
      targetId,
      onPatch,
      onPickGovernorate,
      onPickCity,
    });

  const sharedProps = {
    governorateQuery,
    governorateOptions,
    targetId,
    targetName,
    disabled,
    onPickGovernorate,
    onPickCity,
  };

  return (
    <>
      <StackedList label={CHANGE_COMPANY_TEXT.title}>
        {rows.map((row, index) => (
          <ChangeCompanyRow
            key={row.order.id}
            row={row}
            variant="stacked"
            statusLabel={getStatusLabel(row.order.status)}
            cityOptions={cityOptionsByRow[index] ?? []}
            {...sharedProps}
          />
        ))}
      </StackedList>
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map((label) => (
                <th
                  key={label}
                  className="text-right py-2 px-3 font-semibold text-gray-700 whitespace-nowrap"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <ChangeCompanyRow
                key={row.order.id}
                row={row}
                variant="table"
                statusLabel={getStatusLabel(row.order.status)}
                cityOptions={cityOptionsByRow[index] ?? []}
                {...sharedProps}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
