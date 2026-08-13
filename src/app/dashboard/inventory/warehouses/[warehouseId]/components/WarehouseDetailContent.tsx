'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiaArrowRightSolid,
  LiaBoxOpenSolid,
  LiaExchangeAltSolid,
  LiaBalanceScaleSolid,
} from 'react-icons/lia';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Input from '@/components/ui/Input';
import PageLoading from '@/components/ui/page-loading';
import PaginationFooter from '@/components/ui/pagination-footer';
import {
  useWarehouseQuery,
  useWarehouseStockQuery,
} from '@/services/warehouses';
import type { WarehouseStockItemApi } from '@/lib/api/warehouses';
import { useDebounce } from '@/utils/debounce';
import { AdjustStockModal } from './AdjustStockModal';
import { TransferStockModal } from './TransferStockModal';

interface WarehouseDetailContentProps {
  warehouseId: number;
}

const variantLabel = (item: WarehouseStockItemApi): string =>
  item.options.map((option) => option.option.name).join(' / ') ||
  item.combinationKey;

export function WarehouseDetailContent({
  warehouseId,
}: WarehouseDetailContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const { data: warehouse, isError: isWarehouseError } =
    useWarehouseQuery(warehouseId);
  const debouncedSearch = useDebounce(search, 400);
  const {
    data: stock,
    isLoading,
    isFetching,
    isError,
  } = useWarehouseStockQuery(warehouseId, {
    page,
    limit: pageSize,
    // Server-side search: client-side filtering only saw the current page and
    // produced confidently wrong "no stock" empty states.
    search: debouncedSearch.trim() || undefined,
  });

  const items = useMemo(() => stock?.data ?? [], [stock]);

  // Selection is page-scoped: silently carrying ids across pages made the
  // header checkbox and the action buttons lie about what is selected.
  useEffect(() => {
    setSelectedIds([]);
  }, [page, debouncedSearch]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item.variantId)),
    [items, selectedIds]
  );

  const toggleSelection = (variantId: number) => {
    setSelectedIds((current) =>
      current.includes(variantId)
        ? current.filter((id) => id !== variantId)
        : [...current, variantId]
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === items.length
        ? []
        : items.map((item) => item.variantId)
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const totalPages = stock?.totalPages ?? 0;

  if (isWarehouseError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <LiaBoxOpenSolid className="mb-4 size-16 text-red-300" />
        <p className="text-lg font-medium text-red-500">
          المخزن غير موجود أو تعذر تحميله
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/dashboard/inventory/warehouses')}
            >
              <LiaArrowRightSolid className="size-4" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              {warehouse?.name ?? 'المخزن'}
            </h1>
            {warehouse?.parentWarehouse && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                تابع لـ {warehouse.parentWarehouse.name}
              </span>
            )}
          </div>
          {warehouse?.address && (
            <p className="mt-1 text-sm text-gray-500">{warehouse.address}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={selectedItems.length === 0}
            onClick={() => setIsAdjustOpen(true)}
          >
            <LiaBalanceScaleSolid className="ml-1 size-4" />
            تسوية المخزون
          </Button>
          <Button
            disabled={selectedItems.length === 0}
            onClick={() => setIsTransferOpen(true)}
          >
            <LiaExchangeAltSolid className="ml-1 size-4" />
            نقل مخزون
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
              clearable
              icon={Search}
              placeholder="بحث باسم المنتج أو SKU"
              className="w-full sm:w-72"
            />
            <p className="text-sm text-gray-500">
              إجمالي الكمية: {stock?.totalAvailable ?? 0}
              {selectedItems.length > 0 &&
                ` · محدد: ${selectedItems.length}`}
            </p>
          </div>

          {isLoading ? (
            <PageLoading size="sm" className="min-h-0 py-10" />
          ) : isError ? (
            <p className="py-10 text-center text-sm text-red-500">
              تعذر تحميل مخزون هذا المخزن
            </p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <LiaBoxOpenSolid className="mb-4 size-16" />
              <p className="text-lg font-medium text-gray-500">
                لا يوجد مخزون في هذا المخزن
              </p>
            </div>
          ) : (
            <div
              className={`overflow-x-auto transition-opacity ${
                isFetching ? 'opacity-60' : ''
              }`}
            >
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="py-3 px-3 text-right">
                      <input
                        type="checkbox"
                        checked={
                          items.length > 0 &&
                          selectedIds.length === items.length
                        }
                        onChange={toggleAll}
                        aria-label="تحديد كل الصفوف"
                        className="size-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-700">
                      المنتج
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-700">
                      المتغير
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-700">
                      SKU
                    </th>
                    <th className="py-3 px-3 text-right font-semibold text-gray-700">
                      الكمية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.variantId}
                      className="border-b border-gray-100 hover:bg-gray-50/50"
                    >
                      <td className="py-2.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.variantId)}
                          onChange={() => toggleSelection(item.variantId)}
                          aria-label={`تحديد ${item.productName}`}
                          className="size-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">
                        {variantLabel(item)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-500">
                        {item.sku ?? '—'}
                      </td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          item.quantity < 0 ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !isError && totalPages > 0 && (
            <PaginationFooter
              currentPage={page}
              totalPages={totalPages}
              totalItems={stock?.total ?? 0}
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
        </CardContent>
      </Card>

      <AdjustStockModal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        warehouseId={warehouseId}
        items={selectedItems}
        onSuccess={clearSelection}
      />

      <TransferStockModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        fromWarehouseId={warehouseId}
        items={selectedItems}
        onSuccess={clearSelection}
      />
    </div>
  );
}
