'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { usePermissionCheck } from '@/hooks/usePermissions';
import type { CountSheetRowApi } from '@/lib/api/stockCount';
import { PERMISSION_CODES } from '@/lib/permissions';
import { useCountSheetQuery } from '@/services/stockCount';
import { useAdjustStockMutation, useWarehouseOptions } from '@/services/warehouses';
import { getApiErrorMessage } from '@/utils/apiError';
import { useDebounce } from '@/utils/debounce';
import { OpeningCountTable } from './OpeningCountTable';

const PAGE_SIZE = 50;

interface CountEdit {
  quantity: number;
  raw: string;
}

const isInvalidCount = (raw: string) => {
  if (raw.trim() === '') return true;
  const value = Number(raw);
  return !Number.isInteger(value) || value < 0;
};

export function OpeningCountContent() {
  const searchParams = useSearchParams();
  const { pickerOptions } = useWarehouseOptions();
  const { hasPermission } = usePermissionCheck();
  const canRead = hasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_READ);
  const canAdjust = hasPermission(PERMISSION_CODES.STOCK_MOVEMENTS_ADJUST);
  const adjustMutation = useAdjustStockMutation();

  const [warehouseId, setWarehouseId] = useState(
    searchParams.get('warehouseId') ?? ''
  );
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [edits, setEdits] = useState<Record<number, CountEdit>>({});
  const debouncedSearch = useDebounce(search, 300);

  const warehouseNumber = Number(warehouseId);
  const hasWarehouse = Number.isInteger(warehouseNumber) && warehouseNumber > 0;

  const { data, isLoading } = useCountSheetQuery(
    hasWarehouse && canRead
      ? {
          warehouseId: warehouseNumber,
          search: debouncedSearch.trim() || undefined,
          page,
          pageSize,
        }
      : null
  );

  const rows = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const countedValueOf = (row: CountSheetRowApi) =>
    edits[row.variantId]?.raw ?? String(row.quantity);

  const onCountedChange = (row: CountSheetRowApi, raw: string) => {
    setEdits((current) => ({
      ...current,
      [row.variantId]: { quantity: row.quantity, raw },
    }));
  };

  const adjustments = Object.entries(edits)
    .filter(([, edit]) => !isInvalidCount(edit.raw))
    .map(([variantId, edit]) => ({
      variantId: Number(variantId),
      delta: Number(edit.raw) - edit.quantity,
    }))
    .filter((entry) => entry.delta !== 0);

  const hasInvalid = Object.values(edits).some((edit) =>
    isInvalidCount(edit.raw)
  );

  const onWarehouseChange = (next: string) => {
    setWarehouseId(next);
    setEdits({});
    setPage(1);
  };

  const onSubmit = async () => {
    if (!hasWarehouse) return;
    if (hasInvalid) {
      toast.error('العدد الفعلي يجب أن يكون رقمًا صحيحًا غير سالب');
      return;
    }
    if (adjustments.length === 0) {
      toast.error('لا يوجد فرق بين الكمية بالنظام والعدد الفعلي');
      return;
    }
    try {
      await adjustMutation.mutateAsync({
        warehouseId: warehouseNumber,
        adjustments,
      });
      toast.success('تم حفظ الجرد بنجاح');
      setEdits({});
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'تعذر حفظ الجرد'), {
        autoClose: 8000,
      });
    }
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

      {!hasWarehouse ? (
        <p className="py-8 text-center text-sm text-gray-500">
          اختر مخزنًا لبدء الجرد.
        </p>
      ) : isLoading ? (
        <PageLoading size="sm" className="min-h-0 py-10" />
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">لا توجد متغيرات</p>
      ) : (
        <OpeningCountTable
          rows={rows}
          countedValueOf={countedValueOf}
          isInvalid={isInvalidCount}
          onCountedChange={onCountedChange}
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
          disabled={
            !canAdjust ||
            !hasWarehouse ||
            hasInvalid ||
            adjustments.length === 0 ||
            adjustMutation.isPending
          }
          loading={adjustMutation.isPending}
        >
          حفظ الجرد
        </Button>
      </div>
    </div>
  );
}
