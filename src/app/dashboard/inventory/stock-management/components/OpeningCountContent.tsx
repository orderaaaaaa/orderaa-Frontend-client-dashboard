'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import {
  CountSheetTable,
  isInvalidCountInput,
  type CountSheetLine,
} from '@/components/stock/CountSheetTable';
import { OPENING_COUNT_ADJUSTMENT_REASON } from '@/components/stock/stockLabels';
import { useHasPermissionStrict } from '@/hooks/usePermissions';
import { getCountSheet, type CountSheetParams, type CountSheetRowApi } from '@/lib/api/stockCount';
import type { AdjustStockDto } from '@/lib/api/warehouses';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useCountSheetQuery } from '@/services/stockCount';
import { useAdjustStockMutation, useWarehouseOptions } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { useDebounce } from '@/utils/debounce';

const PAGE_SIZE = 50;

interface CountEdit {
  raw: string;
  query: CountSheetParams;
}

const toCountSheetLine = (row: CountSheetRowApi): CountSheetLine => ({
  variantId: row.variantId,
  productName: row.productName,
  sku: row.sku,
  options: row.options,
  live: row.quantity,
  expected: null,
});

export function OpeningCountContent() {
  const searchParams = useSearchParams();
  const { pickerOptions } = useWarehouseOptions();
  const canRead = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const canAdjust = useHasPermissionStrict(PERMISSION_CODES.STOCK_MOVEMENTS_ADJUST);
  const adjustMutation = useAdjustStockMutation();

  const [warehouseId, setWarehouseId] = useState(
    searchParams.get('warehouseId') ?? ''
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [edits, setEdits] = useState<Record<number, CountEdit>>({});
  const [isPreparing, setIsPreparing] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const warehouseNumber = Number(warehouseId);
  const hasWarehouse = Number.isInteger(warehouseNumber) && warehouseNumber > 0;

  const activeQuery: CountSheetParams = {
    warehouseId: warehouseNumber,
    search: debouncedSearch.trim() || undefined,
    page,
    pageSize,
  };

  const { data, isLoading } = useCountSheetQuery(
    hasWarehouse && canRead ? activeQuery : null
  );

  const rows = data?.data ?? [];
  const lines = rows.map(toCountSheetLine);
  const totalPages = data?.totalPages ?? 1;

  const countedValueOf = (line: CountSheetLine) =>
    edits[line.variantId]?.raw ?? String(line.live ?? 0);

  const onCountedChange = (variantId: number, raw: string) => {
    setEdits((current) => ({
      ...current,
      [variantId]: { raw, query: activeQuery },
    }));
  };

  const onCancelEdit = (variantId: number) => {
    setEdits((current) => {
      const remaining: Record<number, CountEdit> = {};
      Object.entries(current).forEach(([key, edit]) => {
        if (Number(key) !== variantId) remaining[Number(key)] = edit;
      });
      return remaining;
    });
  };

  const hasInvalid =
    lines.some((line) => isInvalidCountInput(countedValueOf(line))) ||
    Object.values(edits).some((edit) => isInvalidCountInput(edit.raw));

  const canSave =
    canAdjust &&
    hasWarehouse &&
    !hasInvalid &&
    Object.keys(edits).length > 0 &&
    !isPreparing &&
    !adjustMutation.isPending;

  const onWarehouseChange = (next: string) => {
    setWarehouseId(next);
    setEdits({});
    setPage(1);
  };

  const freshQuantitiesFor = async (entries: [string, CountEdit][]) => {
    const queries = new Map<string, CountSheetParams>();
    entries.forEach(([, edit]) => {
      queries.set(JSON.stringify(edit.query), edit.query);
    });
    const sheets = await Promise.all(
      Array.from(queries.values()).map((query) => getCountSheet(query))
    );
    const quantities = new Map<number, number>();
    sheets.forEach((sheet) =>
      sheet.data.forEach((row) => quantities.set(row.variantId, row.quantity))
    );
    return quantities;
  };

  const onSubmit = async () => {
    if (!hasWarehouse) return;
    if (hasInvalid) {
      toast.error('العدد الفعلي يجب أن يكون رقمًا صحيحًا غير سالب');
      return;
    }
    const entries = Object.entries(edits);
    if (entries.length === 0) {
      toast.error('لا يوجد فرق بين الكمية بالنظام والعدد الفعلي');
      return;
    }

    setIsPreparing(true);
    let quantities: Map<number, number> | null = null;
    try {
      quantities = await freshQuantitiesFor(entries);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر تحديث كميات الجرد'), {
        autoClose: 8000,
      });
    } finally {
      setIsPreparing(false);
    }
    if (quantities === null) return;

    const adjustments: AdjustStockDto['adjustments'] = [];
    const dropped = new Set<number>();
    let removedFromSheet = 0;
    entries.forEach(([key, edit]) => {
      const variantId = Number(key);
      const fresh = quantities.get(variantId);
      if (fresh === undefined) {
        removedFromSheet += 1;
        dropped.add(variantId);
        return;
      }
      const delta = Number(edit.raw) - fresh;
      if (delta === 0) {
        dropped.add(variantId);
        return;
      }
      adjustments.push({ variantId, delta });
    });

    setEdits((current) => {
      const remaining: Record<number, CountEdit> = {};
      Object.entries(current).forEach(([key, edit]) => {
        if (!dropped.has(Number(key))) remaining[Number(key)] = edit;
      });
      return remaining;
    });

    if (removedFromSheet > 0) {
      toast.warning(
        `أُزيل من الجرد ${removedFromSheet} متغير لأنه لم يعد موجودًا في الصفحة التي عُدّل فيها`,
        { autoClose: 8000 }
      );
    }

    if (adjustments.length === 0) {
      toast.error('لا يوجد فرق بين الكمية بالنظام والعدد الفعلي');
      return;
    }
    try {
      await adjustMutation.mutateAsync({
        warehouseId: warehouseNumber,
        adjustments,
        reason: OPENING_COUNT_ADJUSTMENT_REASON,
      });
      toast.success('تم حفظ الجرد بنجاح');
      setEdits({});
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ الجرد'), {
        autoClose: 8000,
      });
    }
  };

  const onSave = () => {
    if (!canSave) return;
    void onSubmit();
  };

  return (
    <div className="space-y-4" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900">الجرد الافتتاحي</h1>

      <div className="grid gap-3 md:grid-cols-2">
        <SearchableSelect
          options={pickerOptions}
          value={warehouseId}
          onValueChange={onWarehouseChange}
          placeholder="اختر المخزن"
        />
        <Input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ابحث باسم المنتج أو SKU أو الباركود"
        />
      </div>

      {!canRead ? (
        <p className="py-8 text-center text-sm text-gray-500">
          ليس لديك صلاحية لعرض أرصدة المخزن للجرد.
        </p>
      ) : !hasWarehouse ? (
        <p className="py-8 text-center text-sm text-gray-500">
          اختر مخزنًا لبدء الجرد.
        </p>
      ) : isLoading ? (
        <PageLoading size="sm" className="min-h-0 py-10" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">لا توجد متغيرات</p>
      ) : (
        <CountSheetTable
          lines={lines}
          valueOf={countedValueOf}
          onCountedChange={onCountedChange}
          onCancelEdit={onCancelEdit}
          onSave={onSave}
          readOnly={!canAdjust}
        />
      )}

      {hasWarehouse && (
        <PaginationFooter
          currentPage={page}
          totalPages={totalPages}
          totalItems={data?.total ?? 0}
          hasNextPage={page < totalPages}
          hasPreviousPage={page > 1}
          onPageChange={setPage}
          onPrevious={() => setPage(Math.max(1, page - 1))}
          onNext={() => setPage(Math.min(totalPages, page + 1))}
          currentPageSize={pageSize}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!canSave}
          loading={isPreparing || adjustMutation.isPending}
        >
          حفظ الجرد
        </Button>
      </div>
    </div>
  );
}
