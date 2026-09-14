'use client';

import { useMemo } from 'react';
import { LiaTrashSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import {
  VIRTUAL_WAREHOUSE_TERM_KINDS,
  type VirtualWarehouseTermKind,
} from '@/lib/api/virtualWarehouses';
import type { WarehouseOption } from '@/services/warehouses';
import { OrderStatus } from '@/types/orders';
import { StatusRangePicker } from './StatusRangePicker';
import {
  savedWarehouseRef,
  type VirtualWarehouseTermFormData,
} from '../schemas/virtualWarehouse';
import { expandRange } from '../utils/ruleMatching';
import { withReferencedWarehouseOptions } from '../utils/withReferencedWarehouseOptions';
import { VIRTUAL_TERM_SIGN_SYMBOLS } from '../utils/formatVirtualFormula';

export interface VirtualTermRowErrors {
  warehouseId?: string;
  rangeStart?: string;
  excludedStatuses?: string;
  server?: string;
}

interface VirtualTermRowProps {
  index: number;
  term: VirtualWarehouseTermFormData;
  warehouseOptions: WarehouseOption[];
  errors: VirtualTermRowErrors;
  canRemove: boolean;
  onChange: (patch: Partial<VirtualWarehouseTermFormData>) => void;
  onRemove: () => void;
}

const SIGN_OPTIONS = [
  { key: '1', value: VIRTUAL_TERM_SIGN_SYMBOLS['1'] },
  { key: '-1', value: VIRTUAL_TERM_SIGN_SYMBOLS['-1'] },
];

const KIND_OPTIONS: { key: VirtualWarehouseTermKind; value: string }[] = [
  { key: VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE, value: 'مخزن' },
  { key: VIRTUAL_WAREHOUSE_TERM_KINDS.STATUS_RANGE, value: 'نطاق حالات' },
];

const isTermKind = (value: string): value is VirtualWarehouseTermKind =>
  KIND_OPTIONS.some((option) => option.key === value);

export function VirtualTermRow({
  index,
  term,
  warehouseOptions,
  errors,
  canRemove,
  onChange,
  onRemove,
}: VirtualTermRowProps) {
  const isWarehouse = term.kind === VIRTUAL_WAREHOUSE_TERM_KINDS.WAREHOUSE;

  const savedRef = savedWarehouseRef(term);
  const savedRefId = savedRef?.id;
  const savedRefName = savedRef?.name;

  const options = useMemo(
    () =>
      savedRefId !== undefined && savedRefName !== undefined
        ? withReferencedWarehouseOptions(warehouseOptions, [
            { id: savedRefId, name: savedRefName },
          ])
        : warehouseOptions,
    [warehouseOptions, savedRefId, savedRefName]
  );

  const rangeStatuses = useMemo(
    () =>
      term.rangeStart && term.rangeEnd
        ? expandRange(term.rangeStart, term.rangeEnd)
        : [],
    [term.rangeStart, term.rangeEnd]
  );

  const exclusionOptions = useMemo(
    () =>
      rangeStatuses.map((status) => ({
        key: status,
        value: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
      })),
    [rangeStatuses]
  );

  const changeRange = (
    rangeStart: OrderStatus | undefined,
    rangeEnd: OrderStatus | undefined
  ) => {
    const range =
      rangeStart && rangeEnd ? expandRange(rangeStart, rangeEnd) : [];
    onChange({
      rangeStart,
      rangeEnd,
      excludedStatuses: term.excludedStatuses.filter((status) =>
        range.includes(status)
      ),
    });
  };

  const hasError = Boolean(
    errors.server || errors.warehouseId || errors.rangeStart || errors.excludedStatuses
  );

  return (
    <div
      className={`rounded-lg border p-3 ${
        hasError ? 'border-red-300 bg-red-50/40' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="flex flex-wrap items-start gap-2">
        <span className="mt-3 w-6 text-center text-xs font-semibold text-gray-400">
          {index + 1}
        </span>
        <div className="w-20">
          <SearchableSelect
            options={SIGN_OPTIONS}
            value={String(term.sign)}
            searchThreshold={10}
            onValueChange={(next) => onChange({ sign: next === '-1' ? -1 : 1 })}
          />
        </div>
        <div className="w-36">
          <SearchableSelect
            options={KIND_OPTIONS}
            value={term.kind}
            searchThreshold={10}
            onValueChange={(next) => {
              if (!isTermKind(next) || next === term.kind) return;
              onChange({
                kind: next,
                warehouseId: '',
                warehouseName: undefined,
                rangeStart: undefined,
                rangeEnd: undefined,
                excludedStatuses: [],
              });
            }}
          />
        </div>

        <div className="min-w-[220px] flex-1">
          {isWarehouse ? (
            <SearchableSelect
              options={options}
              value={term.warehouseId}
              onValueChange={(next) => onChange({ warehouseId: next })}
              placeholder="اختر المخزن"
              emptyMessage="لا توجد مخازن"
              error={errors.warehouseId}
            />
          ) : (
            <div className="space-y-2">
              <StatusRangePicker
                rangeStart={term.rangeStart}
                rangeEnd={term.rangeEnd}
                onChange={changeRange}
              />
              {errors.rangeStart && !(term.rangeStart && term.rangeEnd) && (
                <p className="text-xs text-red-500">{errors.rangeStart}</p>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  استثناء حالات
                </label>
                <MultiSelectDropdown
                  options={exclusionOptions}
                  value={term.excludedStatuses}
                  onChange={(next) =>
                    onChange({
                      excludedStatuses: rangeStatuses.filter((status) =>
                        next.includes(status)
                      ),
                    })
                  }
                  placeholder={
                    rangeStatuses.length === 0
                      ? 'اختر النطاق أولًا'
                      : 'بدون استثناء'
                  }
                  disabled={rangeStatuses.length === 0}
                  error={errors.excludedStatuses}
                />
              </div>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mt-1.5 text-red-600 hover:text-red-700"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="حذف البند"
        >
          <LiaTrashSolid className="size-4" />
        </Button>
      </div>

      {errors.server && (
        <p className="mt-2 text-xs text-red-600">{errors.server}</p>
      )}
    </div>
  );
}
