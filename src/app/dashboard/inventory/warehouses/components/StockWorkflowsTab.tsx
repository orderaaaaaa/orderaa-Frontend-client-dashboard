'use client';

import { useEffect, useMemo, useState } from 'react';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/utils/apiError';
import { LiaPlusSolid, LiaTrashSolid, LiaSaveSolid } from 'react-icons/lia';
import { Button } from '@/components/ui/button';
import BaseModal from '@/components/ui/base-modal';
import PageLoading from '@/components/ui/page-loading';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { FormSwitch } from '@/components/ui/form-switch';
import { OrderStatus } from '@/types/orders';
import { ORDER_STATUS_ARABIC_LABELS } from '@/app/dashboard/constants/statusMappings';
import {
  useStockWorkflowsQuery,
  useCreateStockWorkflowMutation,
  useUpdateStockWorkflowMutation,
  useDeleteStockWorkflowMutation,
  useWarehouseOptions,
} from '@/services/warehouses';
import type {
  InsufficientStockBehavior,
  StockWorkflowApiItem,
} from '@/lib/api/warehouses';
import {
  CREATION_RULE_KEY,
  CREATION_RULE_LABEL,
  INSUFFICIENT_STOCK_OPTIONS,
  WORKFLOW_ORDER_STATUSES,
} from '../constants';

interface RuleRow {
  /** undefined for rows that have not been saved yet */
  id?: number;
  /**
   * T14 — SETS, not single statuses.
   *
   * An EMPTY `fromStatuses` means "on order creation" (the wire meaning too).
   * It does NOT mean "any source": that is the fully expanded list, offered as
   * its own button. Conflating the two would re-create the collision the
   * backend design exists to prevent, so the UI keeps them visually distinct.
   */
  isCreation: boolean;
  fromStatuses: OrderStatus[];
  toStatuses: OrderStatus[];
  fromWarehouseId: string;
  toWarehouseId: string;
  allowNegative: boolean;
  onInsufficient: InsufficientStockBehavior;
  dirty: boolean;
  touched: boolean;
}

const toRow = (rule: StockWorkflowApiItem): RuleRow => ({
  id: rule.id,
  isCreation: rule.fromStatuses.length === 0,
  fromStatuses: rule.fromStatuses,
  toStatuses: rule.toStatuses,
  fromWarehouseId: String(rule.fromWarehouseId),
  toWarehouseId: String(rule.toWarehouseId),
  allowNegative: rule.allowNegative,
  onInsufficient: rule.onInsufficient,
  dirty: false,
  touched: false,
});

const emptyRow = (): RuleRow => ({
  isCreation: true,
  fromStatuses: [],
  toStatuses: [],
  fromWarehouseId: '',
  toWarehouseId: '',
  allowNegative: false,
  onInsufficient: 'THROW',
  // `dirty` enables Save; `touched` gates inline errors so a freshly added
  // row isn't red before the user has typed anything.
  dirty: true,
  touched: false,
});

const statusOptions = WORKFLOW_ORDER_STATUSES.map((status) => ({
  key: status,
  value: ORDER_STATUS_ARABIC_LABELS[status] ?? status,
}));

const fromStatusOptions = [
  { key: CREATION_RULE_KEY, value: CREATION_RULE_LABEL },
  ...statusOptions,
];

export function StockWorkflowsTab() {
  const { data, isLoading, isError } = useStockWorkflowsQuery();
  const { options: warehouseOptions } = useWarehouseOptions();

  const createMutation = useCreateStockWorkflowMutation();
  const updateMutation = useUpdateStockWorkflowMutation();
  const deleteMutation = useDeleteStockWorkflowMutation();

  const [rows, setRows] = useState<RuleRow[]>([]);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Reconcile server rules into local rows WITHOUT discarding work in progress:
  // a refetch (triggered by every save/delete) must not wipe unsaved rows or
  // dirty edits the user is still typing.
  useEffect(() => {
    if (!data) return;
    setRows((current) => {
      const dirtyById = new Map(
        current.filter((row) => row.dirty && row.id).map((row) => [row.id, row])
      );
      const unsaved = current.filter((row) => !row.id);
      const serverRows = data.map((rule) => dirtyById.get(rule.id) ?? toRow(rule));
      return [...serverRows, ...unsaved];
    });
  }, [data]);

  // Flag only the SECOND and later occurrences: the already-saved first row
  // must not turn red because someone started typing a clashing new row.
  const duplicateRowIndexes = useMemo(() => {
    const seen = new Set<string>();
    const dupes = new Set<number>();
    rows.forEach((row, index) => {
      if (row.toStatuses.length === 0 && !row.isCreation) return;
      // Same-specificity duplicates only; a broader rule alongside a narrower
      // one is legal and resolved by precedence server-side.
      const key = `${[...row.fromStatuses].sort().join(',')}→${[...row.toStatuses].sort().join(',')}`;
      if (seen.has(key)) dupes.add(index);
      seen.add(key);
    });
    return dupes;
  }, [rows]);

  const patchRow = (index: number, patch: Partial<RuleRow>) => {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, ...patch, dirty: true, touched: true } : row
      )
    );
  };

  const rowError = (row: RuleRow, index: number): string | null => {
    // A creation rule must name exactly one target — the backend and its
    // partial unique index both enforce this.
    if (row.isCreation && row.toStatuses.length !== 1)
      return 'قاعدة الإنشاء يجب أن تحدد حالة هدف واحدة فقط';
    if (!row.isCreation && row.fromStatuses.length === 0)
      return 'اختر حالات المصدر';
    if (!row.isCreation && row.toStatuses.length === 0)
      return 'اختر حالات الهدف';
    if (
      !row.isCreation &&
      row.fromStatuses.some((status) => row.toStatuses.includes(status))
    )
      return 'لا يمكن أن تظهر نفس الحالة في الجانبين';
    if (!row.fromWarehouseId || !row.toWarehouseId) return 'اختر المخزنين';
    if (row.fromWarehouseId === row.toWarehouseId)
      return 'يجب أن يختلف مخزن المصدر عن مخزن الوجهة';
    if (duplicateRowIndexes.has(index)) return 'قاعدة مكررة لنفس التحويل';
    return null;
  };

  const saveRow = async (index: number) => {
    const row = rows[index];
    const error = rowError(row, index);
    if (error) {
      toast.error(error);
      return;
    }

    const body = {
      // Empty = creation rule. "Any source" is sent as the full list instead.
      fromStatuses: row.isCreation ? [] : row.fromStatuses,
      toStatuses: row.toStatuses,
      fromWarehouseId: Number(row.fromWarehouseId),
      toWarehouseId: Number(row.toWarehouseId),
      allowNegative: row.allowNegative,
      onInsufficient: row.onInsufficient,
    };

    const rowKey = row.id ? `rule-${row.id}` : `new-${index}`;
    setSavingKey(rowKey);
    try {
      if (row.id) {
        await updateMutation.mutateAsync({ id: row.id, body });
        // Clear dirty so the merge effect stops preferring the local copy
        // and the Save button confirms the write landed.
        setRows((current) =>
          current.map((r, i) =>
            i === index ? { ...r, dirty: false, touched: false } : r
          )
        );
      } else {
        const created = await createMutation.mutateAsync(body);
        // Adopt the server row (with its id) — otherwise the refetch brings
        // the rule back as a NEW row while the id-less local row survives
        // the merge, leaving a duplicate ghost flagged as a conflict.
        setRows((current) =>
          current.map((r, i) => (i === index ? toRow(created) : r))
        );
      }
      toast.success('تم حفظ القاعدة بنجاح');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ القاعدة'));
    } finally {
      setSavingKey(null);
    }
  };

  const removeRow = (index: number) => {
    const row = rows[index];
    if (!row.id) {
      setRows((current) => current.filter((_, i) => i !== index));
      return;
    }
    setPendingDelete(row.id);
  };

  const confirmDelete = async () => {
    if (pendingDelete == null) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete);
      toast.success('تم حذف القاعدة');
      setPendingDelete(null);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حذف القاعدة'));
    }
  };

  if (isLoading) {
    return <PageLoading size="sm" className="min-h-0 py-10" />;
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-red-500">
        تعذر تحميل قواعد حركة المخزون
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        حدد حركة المخزون التلقائية عند تغيير حالة الطلب. القواعد غير المعرفة لا
        تحرك المخزون.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" dir="rtl">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                من الحالة
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                إلى الحالة
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                من مخزن
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                إلى مخزن
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                السماح بالسالب
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                عند عدم الكفاية
              </th>
              <th className="py-3 px-3 text-right font-semibold text-gray-700">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const error = row.touched ? rowError(row, index) : null;
              return (
                <tr
                  key={row.id ?? `new-${index}`}
                  className="border-b border-gray-100 align-top"
                >
                  <td className="py-2.5 px-3 min-w-[220px]">
                    {/* "عند إنشاء الطلب" and "كل الحالات" are DIFFERENT things
                        and are kept visually distinct on purpose: an empty
                        from-side means creation, while "any source" is the
                        fully expanded list. */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            patchRow(index, { isCreation: true, fromStatuses: [] })
                          }
                          className={`text-[11px] px-2 py-1 rounded-full border ${
                            row.isCreation
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          {CREATION_RULE_LABEL}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            patchRow(index, {
                              isCreation: false,
                              fromStatuses: [...WORKFLOW_ORDER_STATUSES],
                            })
                          }
                          className="text-[11px] px-2 py-1 rounded-full border border-gray-300 text-gray-600"
                        >
                          كل الحالات
                        </button>
                      </div>
                      {!row.isCreation && (
                        <MultiSelectDropdown
                          options={statusOptions}
                          value={row.fromStatuses}
                          onChange={(next) =>
                            patchRow(index, {
                              isCreation: false,
                              fromStatuses: next as OrderStatus[],
                            })
                          }
                          placeholder="من الحالات"
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 min-w-[220px]">
                    <MultiSelectDropdown
                      options={statusOptions}
                      value={row.toStatuses}
                      onChange={(next) =>
                        patchRow(index, { toStatuses: next as OrderStatus[] })
                      }
                      placeholder="إلى الحالات"
                    />
                  </td>
                  <td className="py-2.5 px-3 min-w-[160px]">
                    <SearchableSelect
                      options={warehouseOptions}
                      value={row.fromWarehouseId}
                      onValueChange={(next) =>
                        patchRow(index, { fromWarehouseId: next })
                      }
                      placeholder="من مخزن"
                    />
                  </td>
                  <td className="py-2.5 px-3 min-w-[160px]">
                    <SearchableSelect
                      options={warehouseOptions}
                      value={row.toWarehouseId}
                      onValueChange={(next) =>
                        patchRow(index, { toWarehouseId: next })
                      }
                      placeholder="إلى مخزن"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <FormSwitch
                      checked={row.allowNegative}
                      onCheckedChange={(checked) =>
                        patchRow(index, { allowNegative: checked })
                      }
                    />
                  </td>
                  <td className="py-2.5 px-3 min-w-[150px]">
                    <SearchableSelect
                      options={INSUFFICIENT_STOCK_OPTIONS}
                      value={row.onInsufficient}
                      onValueChange={(next) =>
                        patchRow(index, {
                          onInsufficient: next as InsufficientStockBehavior,
                        })
                      }
                      placeholder="عند عدم الكفاية"
                      disabled={row.allowNegative}
                    />
                    <p className="mt-1 text-[11px] leading-4 text-gray-400">
                      {row.allowNegative
                        ? 'يتم تنفيذ الحركة حتى لو كانت الكمية غير كافية'
                        : row.onInsufficient === 'THROW'
                          ? 'يُمنع تغيير حالة الطلب عند نقص المخزون'
                          : 'يتم تخطي الحركة وتستمر حالة الطلب'}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveRow(index)}
                        disabled={
                          !row.dirty ||
                          savingKey ===
                            (row.id ? `rule-${row.id}` : `new-${index}`)
                        }
                        loading={
                          savingKey ===
                          (row.id ? `rule-${row.id}` : `new-${index}`)
                        }
                      >
                        <LiaSaveSolid className="ml-1 size-4" />
                        حفظ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => removeRow(index)}
                      >
                        <LiaTrashSolid className="size-4" />
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-1 text-[11px] text-red-500">{error}</p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          لا توجد قواعد بعد — لن يتحرك المخزون تلقائيًا عند تغيير حالات الطلبات.
        </p>
      )}

      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setRows((current) => [...current, emptyRow()])}
      >
        <LiaPlusSolid className="ml-1 size-4" />
        إضافة قاعدة
      </Button>

      <BaseModal
        isOpen={pendingDelete != null}
        onClose={() => setPendingDelete(null)}
        title="حذف القاعدة"
        confirmText="حذف"
        confirmButtonClassName="bg-red-600 hover:bg-red-700"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        maxWidth="md:max-w-[420px]"
      >
        <p className="text-sm text-gray-600">
          بحذف هذه القاعدة لن يتحرك المخزون عند هذا التحويل بين الحالات.
        </p>
      </BaseModal>
    </div>
  );
}
