'use client';

import SearchableSelect from '@/components/ui/SearchableSelect';
import { StackedRow } from '@/components/ui/stacked-list';
import CopyableCode from '@/components/ui/copyable-code';
import type { LocationOption } from '@/types/locationOptions';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import {
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyRow as ChangeCompanyRowState,
} from '../types/bulkCompanySwitch';
import type { PickOption } from '../utils/switchRows';
import { rowMessageOf } from '../utils/switchResults';

interface ChangeCompanyRowProps {
  row: ChangeCompanyRowState;
  variant: 'table' | 'stacked';
  statusLabel: string;
  governorateOptions: LocationOption[];
  cityOptions: LocationOption[];
  targetId: number | null;
  targetName: string;
  disabled: boolean;
  onPickGovernorate: (orderId: number, option: PickOption | null) => void;
  onPickCity: (orderId: number, option: PickOption | null) => void;
}

function PackagingWarningBadge({ text }: { text: string }) {
  return (
    <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700 break-words">
      {text}
    </span>
  );
}

export function ChangeCompanyRow({
  row,
  variant,
  statusLabel,
  governorateOptions,
  cityOptions,
  targetId,
  targetName,
  disabled,
  onPickGovernorate,
  onPickCity,
}: ChangeCompanyRowProps) {
  const orderId = row.order.id;
  const governorateOption = row.picks.governorateOption;
  const governorateItems = governorateOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));
  const cityItems = cityOptions.map((option) => ({
    key: option.value,
    label: option.label,
  }));

  const editable =
    row.status === CHANGE_COMPANY_ROW_STATUS.READY ||
    row.status === CHANGE_COMPANY_ROW_STATUS.SKIPPED_LOCAL;
  const governorateDisabled = disabled || !editable || targetId === null;
  const cityDisabled = governorateDisabled || governorateOption === null;
  const warning = row.order.packagingWarning ? (
    <PackagingWarningBadge text={row.order.packagingWarning} />
  ) : null;
  const resultText =
    row.status === CHANGE_COMPANY_ROW_STATUS.SENDING
      ? CHANGE_COMPANY_TEXT.sending
      : rowMessageOf(row, targetName);
  const currentCompany = row.snapshot.companyName ?? CHANGE_COMPANY_TEXT.noCompany;

  const governorateSelect = (
    <SearchableSelect
      aria-label={CHANGE_COMPANY_TEXT.colGovernorate}
      options={governorateItems}
      value={governorateOption ?? ''}
      placeholder={CHANGE_COMPANY_TEXT.colGovernorate}
      disabled={governorateDisabled}
      portal
      onValueChange={(key) => {
        const option = governorateItems.find((item) => item.key === key);
        onPickGovernorate(orderId, option ? { value: option.key, label: option.label } : null);
      }}
    />
  );

  const citySelect = (
    <SearchableSelect
      aria-label={CHANGE_COMPANY_TEXT.colCity}
      options={cityItems}
      value={row.picks.cityOption ?? ''}
      placeholder={CHANGE_COMPANY_TEXT.colCity}
      disabled={cityDisabled}
      portal
      onValueChange={(key) => {
        const option = cityItems.find((item) => item.key === key);
        onPickCity(orderId, option ? { value: option.key, label: option.label } : null);
      }}
    />
  );

  if (variant === 'stacked') {
    return (
      <StackedRow
        alert={warning}
        title={
          <CopyableCode value={row.order.code} label="نسخ كود الطلب">
            <span className="font-mono">{row.order.code}</span>
          </CopyableCode>
        }
        fields={[
          { label: CHANGE_COMPANY_TEXT.colStatus, value: statusLabel },
          { label: CHANGE_COMPANY_TEXT.colAddress, value: row.order.address ?? '' },
          { label: CHANGE_COMPANY_TEXT.colCurrentCompany, value: currentCompany },
          { label: CHANGE_COMPANY_TEXT.colGovernorate, value: governorateSelect },
          { label: CHANGE_COMPANY_TEXT.colCity, value: citySelect },
          { label: CHANGE_COMPANY_TEXT.colResult, value: resultText },
        ]}
      />
    );
  }

  return (
    <tr className="border-t align-top">
      <td className="py-2 px-3 font-mono text-gray-900">
        <div className="flex flex-col gap-1">
          <CopyableCode value={row.order.code} label="نسخ كود الطلب">
            <span>{row.order.code}</span>
          </CopyableCode>
          {warning}
        </div>
      </td>
      <td className="py-2 px-3 text-gray-600">{statusLabel}</td>
      <td className="py-2 px-3 text-gray-600 break-words">{row.order.address ?? ''}</td>
      <td className="py-2 px-3 text-gray-600">{currentCompany}</td>
      <td className="py-2 px-3 min-w-[140px]">{governorateSelect}</td>
      <td className="py-2 px-3 min-w-[140px]">{citySelect}</td>
      <td className="py-2 px-3 text-gray-600 break-words">{resultText}</td>
    </tr>
  );
}
