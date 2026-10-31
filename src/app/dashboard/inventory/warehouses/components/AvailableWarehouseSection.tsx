'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { LiaSaveSolid, LiaTrashSolid } from 'react-icons/lia';
import { Lock } from 'lucide-react';
import { getApiErrorMessage } from '@/utils/apiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useI18n } from '@/i18n/I18nProvider';
import {
  useCreateStockWorkflowMutation,
  useDeleteStockWorkflowMutation,
  useUpdateStockWorkflowMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import { useVirtualWarehousesQuery } from '@/services/virtualWarehouses';
import type { StockWorkflowApiItem } from '@/lib/api/warehouses';
import { withReferencedWarehouseOptions } from '../utils/withReferencedWarehouseOptions';

interface Props {
  availableRule: StockWorkflowApiItem | undefined;
  isLoading: boolean;
}

interface TargetChoice {
  value: string;
  label: string;
  disabled: boolean;
}

interface SavedTarget {
  value: string;
  name: string;
  isVirtual: boolean;
}

const PHYSICAL_PREFIX = 'p:';
const VIRTUAL_PREFIX = 'v:';

const savedTargetOf = (rule: StockWorkflowApiItem): SavedTarget | null => {
  if (rule.toVirtualWarehouseId != null) {
    return {
      value: `${VIRTUAL_PREFIX}${rule.toVirtualWarehouseId}`,
      name: rule.toVirtualWarehouse?.name ?? '',
      isVirtual: true,
    };
  }
  if (rule.toWarehouseId != null) {
    return {
      value: `${PHYSICAL_PREFIX}${rule.toWarehouseId}`,
      name: rule.toWarehouse?.name ?? '',
      isVirtual: false,
    };
  }
  return null;
};

const isVirtualValue = (value: string) => value.startsWith(VIRTUAL_PREFIX);

const idOfValue = (value: string) => Number(value.slice(VIRTUAL_PREFIX.length));

export function AvailableWarehouseSection({ availableRule, isLoading }: Props) {
  const { t, dir } = useI18n();
  const { pickerOptions } = useWarehouseOptions();
  const virtualQuery = useVirtualWarehousesQuery();
  const virtualData = virtualQuery.data;

  const createMutation = useCreateStockWorkflowMutation();
  const updateMutation = useUpdateStockWorkflowMutation();
  const deleteMutation = useDeleteStockWorkflowMutation();

  const [pick, setPick] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const saved = availableRule ? savedTargetOf(availableRule) : null;
  const savedValue = saved?.value ?? '';
  const value = pick ?? savedValue;
  const isDirty = value !== savedValue;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isLocked = availableRule?.presetKey != null;

  const physicalChoices = useMemo<TargetChoice[]>(
    () =>
      withReferencedWarehouseOptions(pickerOptions, [availableRule?.toWarehouse])
        .filter(
          (option) => !option.disabled || `${PHYSICAL_PREFIX}${option.key}` === savedValue
        )
        .map((option) => ({
          value: `${PHYSICAL_PREFIX}${option.key}`,
          label: option.value,
          disabled: option.disabled ?? false,
        })),
    [pickerOptions, availableRule, savedValue]
  );

  const virtualChoices = useMemo<TargetChoice[]>(() => {
    const rows = (virtualData ?? []).map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      isActive: warehouse.isActive,
    }));
    const referenced = availableRule?.toVirtualWarehouse;
    if (referenced && !rows.some((row) => row.id === referenced.id)) {
      rows.push({ id: referenced.id, name: referenced.name, isActive: false });
    }
    return rows
      .filter((row) => row.isActive || `${VIRTUAL_PREFIX}${row.id}` === savedValue)
      .map((row) => ({
        value: `${VIRTUAL_PREFIX}${row.id}`,
        label: row.name,
        disabled: !row.isActive,
      }));
  }, [virtualData, availableRule, savedValue]);

  const save = async () => {
    if (!value || !isDirty) return;
    const body = isVirtualValue(value)
      ? { toVirtualWarehouseId: idOfValue(value) }
      : { toWarehouseId: Number(value.slice(PHYSICAL_PREFIX.length)) };
    try {
      const result = availableRule
        ? await updateMutation.mutateAsync({ id: availableRule.id, body })
        : await createMutation.mutateAsync({ eventType: 'AVAILABLE', ...body });
      const target = savedTargetOf(result);
      setPick(target?.value ?? null);
      toast.success(t('stockRules.available.saved'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('stockRules.saveFailed')));
    }
  };

  const confirmDelete = async () => {
    if (!availableRule) return;
    try {
      await deleteMutation.mutateAsync(availableRule.id);
      setPick(null);
      setConfirmingDelete(false);
      toast.success(t('stockRules.available.deleted'));
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t('stockRules.saveFailed')));
    }
  };

  const renderKindBadge = (isVirtual: boolean) => (
    <Badge variant={isVirtual ? 'secondary' : 'outline'}>
      {t(
        isVirtual
          ? 'stockRules.available.kindVirtual'
          : 'stockRules.available.kindPhysical'
      )}
    </Badge>
  );

  return (
    <div
      className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
      dir={dir}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-900">
          {t('stockRules.available.title')}
        </h3>
        <p className="text-[11px] leading-4 text-gray-500">
          {t('stockRules.available.hint')}
        </p>
      </div>

      {isLoading ? (
        <p className="text-[11px] text-gray-400">
          {t('stockRules.available.loading')}
        </p>
      ) : isLocked ? (
        <div className="space-y-2">
          {saved && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">
                {t('stockRules.available.current')}
              </span>
              {renderKindBadge(saved.isVirtual)}
              <span className="font-medium text-gray-900">{saved.name}</span>
            </div>
          )}
          <p className="flex items-center gap-2 text-[11px] leading-4 text-gray-500">
            <Lock className="size-3.5 shrink-0" />
            {t('stockRules.available.locked')}
          </p>
        </div>
      ) : (
        <>
          {saved && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">
                {t('stockRules.available.current')}
              </span>
              {renderKindBadge(saved.isVirtual)}
              <span className="font-medium text-gray-900">{saved.name}</span>
            </div>
          )}

          {!saved && (
            <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 p-2 text-amber-900">
              <p className="text-xs font-medium">
                {t('orderDetails.stock.availableWarehouseNotSet')}
              </p>
              <p className="text-[11px] leading-4">
                {t('stockRules.available.empty')}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1 sm:max-w-sm">
              <Select
                value={value}
                onValueChange={(next) => setPick(next)}
                disabled={isSaving}
              >
                <SelectTrigger className="w-full" dir={dir}>
                  <SelectValue
                    placeholder={t('stockRules.available.placeholder')}
                  />
                </SelectTrigger>
                <SelectContent dir={dir}>
                  {physicalChoices.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>
                        {t('stockRules.available.groupPhysical')}
                      </SelectLabel>
                      {physicalChoices.map((choice) => (
                        <SelectItem
                          key={choice.value}
                          value={choice.value}
                          disabled={choice.disabled}
                        >
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {virtualChoices.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>
                        {t('stockRules.available.groupVirtual')}
                      </SelectLabel>
                      {virtualChoices.map((choice) => (
                        <SelectItem
                          key={choice.value}
                          value={choice.value}
                          disabled={choice.disabled}
                        >
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="sm"
              onClick={save}
              disabled={!value || !isDirty || isSaving}
              loading={isSaving}
            >
              <LiaSaveSolid className="me-1 size-4" />
              {availableRule
                ? t('common.save')
                : t('stockRules.available.setAction')}
            </Button>

            {availableRule && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setConfirmingDelete(true)}
              >
                <LiaTrashSolid className="size-4" />
              </Button>
            )}
          </div>
        </>
      )}

      <BaseModal
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title={t('stockRules.available.deleteTitle')}
        confirmText={t('common.delete')}
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[420px]"
      >
        <p className="text-sm text-gray-600">
          {t('stockRules.available.deleteWarning')}
        </p>
      </BaseModal>
    </div>
  );
}
