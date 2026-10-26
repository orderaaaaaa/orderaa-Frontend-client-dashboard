'use client';

import { useEffect } from 'react';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { StackedRow } from '@/components/ui/stacked-list';
import { useStatusLabel } from '@/hooks/useStatusLabel';
import { useLocationOptionCities, useLocationOptionGovernorates } from '@/services/lookups';
import { CHANGE_COMPANY_TEXT } from '../constants/changeCompany';
import type { PickOption } from '../utils/switchRows';
import { rowMessageOf } from '../utils/switchResults';
import {
  CHANGE_COMPANY_ROW_STATUS,
  type ChangeCompanyRow as ChangeCompanyRowState,
} from '../types/bulkCompanySwitch';

interface ChangeCompanyRowProps {
  row: ChangeCompanyRowState;
  variant: 'table' | 'stacked';
  targetId: number | null;
  targetName: string;
  disabled: boolean;
  onPatch: (orderId: number, patch: Partial<ChangeCompanyRowState>) => void;
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
  targetId,
  targetName,
  disabled,
  onPatch,
  onPickGovernorate,
  onPickCity,
}: ChangeCompanyRowProps) {
  const { getStatusLabel } = useStatusLabel();
  const orderId = row.order.id;
  const governorateOption = row.picks.governorateOption;
  const governorates = useLocationOptionGovernorates(targetId);
  const cities = useLocationOptionCities(targetId, governorateOption ?? undefined);
  const governorateItems = (governorates.data?.options ?? []).map((option) => ({
    key: option.value,
    label: option.label,
  }));
  const cityItems = (cities.data?.options ?? []).map((option) => ({
    key: option.value,
    label: option.label,
  }));

  useEffect(() => {
    if (targetId === null || !governorates.data) return;
    if (row.prefillTargetId === targetId) return;
    const current = (row.order.governorate ?? '').trim();
    const match = governorates.data.options.find((option) => option.label.trim() === current);
    if (match && row.picks.governorateOption === null) {
      onPickGovernorate(orderId, { value: match.value, label: match.label });
    }
    onPatch(orderId, { prefillTargetId: targetId });
  }, [
    targetId,
    governorates.data,
    row.prefillTargetId,
    row.picks.governorateOption,
    row.order.governorate,
    orderId,
    onPatch,
    onPickGovernorate,
  ]);

  useEffect(() => {
    if (governorateOption === null || !cities.data) return;
    if (row.cityPrefillKey === governorateOption) return;
    const current = (row.order.city ?? '').trim();
    const match = cities.data.options.find((option) => option.label.trim() === current);
    if (match && row.picks.cityOption === null) {
      onPickCity(orderId, { value: match.value, label: match.label });
    }
    onPatch(orderId, { cityPrefillKey: governorateOption });
  }, [
    governorateOption,
    cities.data,
    row.cityPrefillKey,
    row.picks.cityOption,
    row.order.city,
    orderId,
    onPatch,
    onPickCity,
  ]);

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
      options={governorateItems}
      value={governorateOption ?? ''}
      placeholder={CHANGE_COMPANY_TEXT.colGovernorate}
      disabled={governorateDisabled}
      onValueChange={(key) => {
        const option = governorateItems.find((item) => item.key === key);
        onPickGovernorate(orderId, option ? { value: option.key, label: option.label } : null);
      }}
    />
  );

  const citySelect = (
    <SearchableSelect
      options={cityItems}
      value={row.picks.cityOption ?? ''}
      placeholder={CHANGE_COMPANY_TEXT.colCity}
      disabled={cityDisabled}
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
        title={<span className="font-mono">{row.order.code}</span>}
        fields={[
          { label: CHANGE_COMPANY_TEXT.colStatus, value: getStatusLabel(row.order.status) },
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
          <span>{row.order.code}</span>
          {warning}
        </div>
      </td>
      <td className="py-2 px-3 text-gray-600">{getStatusLabel(row.order.status)}</td>
      <td className="py-2 px-3 text-gray-600 break-words">{row.order.address ?? ''}</td>
      <td className="py-2 px-3 text-gray-600">{currentCompany}</td>
      <td className="py-2 px-3 min-w-[140px]">{governorateSelect}</td>
      <td className="py-2 px-3 min-w-[140px]">{citySelect}</td>
      <td className="py-2 px-3 text-gray-600 break-words">{resultText}</td>
    </tr>
  );
}
